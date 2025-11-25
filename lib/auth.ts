import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// JWT secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

export interface JWTPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token (using jose for compatibility)
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token (using jose for compatibility)
 * Note: For Edge Runtime (middleware), use verifyTokenEdge from lib/auth-edge.ts
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  const { jwtVerify } = await import("jose");
  
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      email: payload.email as string,
      role: payload.role as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL_LOGIN;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("Admin credentials not configured in environment variables");
    return false;
  }

  // Check if email matches
  if (email !== adminEmail) {
    return false;
  }

  // For backward compatibility: if password is not hashed, compare directly
  // In production, you should hash the password and store it in env
  if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$")) {
    // Password is already hashed
    return await verifyPassword(password, adminPassword);
  } else {
    // Plain text password (for backward compatibility)
    // WARNING: In production, always use hashed passwords
    return password === adminPassword;
  }
}
