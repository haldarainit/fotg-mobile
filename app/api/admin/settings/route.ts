import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";

// Middleware to check authentication
function checkAuth(request: NextRequest) {
  const token = request.cookies.get("admin_token");
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}

// GET - Fetch settings (public access for quote page)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await Settings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        taxPercentage: 0,
        discountRules: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { taxPercentage, discountRules } = body;

    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings
      settings = await Settings.create({
        taxPercentage: taxPercentage ?? 0,
        discountRules: discountRules ?? [],
      });
    } else {
      // Update existing settings
      if (taxPercentage !== undefined) {
        settings.taxPercentage = taxPercentage;
      }
      if (discountRules !== undefined) {
        settings.discountRules = discountRules;
      }
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
