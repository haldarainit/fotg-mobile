// Rate limiting store
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5; // Maximum login attempts
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const BLOCK_DURATION_MS = 30 * 60 * 1000; // Block for 30 minutes after max attempts

/**
 * Clean up old entries from rate limit store
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries older than the window
    if (now - entry.firstAttempt > WINDOW_MS && (!entry.blockedUntil || now > entry.blockedUntil)) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if an identifier (IP/email) is rate limited
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil?: number;
} {
  cleanupOldEntries();
  
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No previous attempts
  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: entry.blockedUntil,
    };
  }

  // Check if window has expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    // Reset the window
    rateLimitStore.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    const blockedUntil = now + BLOCK_DURATION_MS;
    entry.blockedUntil = blockedUntil;
    rateLimitStore.set(identifier, entry);
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - entry.attempts,
  };
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    // First attempt or window expired
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
    });
  } else {
    // Increment attempts
    entry.attempts += 1;
    rateLimitStore.set(identifier, entry);
  }
}

/**
 * Reset rate limit for an identifier (on successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get client identifier (IP address or email)
 */
export function getClientIdentifier(request: Request, email?: string): string {
  // Use email if provided for more accurate tracking
  if (email) {
    return `email:${email}`;
  }

  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
  return `ip:${ip}`;
}
