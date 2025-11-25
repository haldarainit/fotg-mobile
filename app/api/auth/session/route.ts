import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({
        success: true,
        authenticated: false,
      });
    }

    // Verify JWT token
    const payload = await verifyToken(token);

    if (payload) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          email: payload.email,
          role: payload.role,
        },
      });
    }

    // Token is invalid or expired
    return NextResponse.json({
      success: true,
      authenticated: false,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    );
  }
}
