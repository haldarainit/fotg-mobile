import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, generateToken } from "@/lib/auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getClientIdentifier,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const identifier = getClientIdentifier(request, email);
    const rateLimitCheck = checkRateLimit(identifier);

    if (!rateLimitCheck.allowed) {
      const blockedMinutes = rateLimitCheck.blockedUntil
        ? Math.ceil((rateLimitCheck.blockedUntil - Date.now()) / 60000)
        : 30;

      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Please try again in ${blockedMinutes} minutes.`,
          blockedUntil: rateLimitCheck.blockedUntil,
        },
        { status: 429 }
      );
    }

    // Verify credentials with secure comparison
    const isValid = await verifyAdminCredentials(email, password);

    if (isValid) {
      // Reset rate limit on successful login
      resetRateLimit(identifier);

      // Generate secure JWT token
      const token = await generateToken({
        email,
        role: "admin",
      });

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
      });

      // Set secure HTTP-only cookie
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    } else {
      // Record failed attempt
      recordFailedAttempt(identifier);

      // Get updated rate limit info
      const updatedRateLimit = checkRateLimit(identifier);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
          remainingAttempts: updatedRateLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
