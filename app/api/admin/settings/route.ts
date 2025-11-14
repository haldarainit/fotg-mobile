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

    let settings = await Settings.findOne().lean();
    
    // If no settings exist, create default settings
    if (!settings) {
      const newSettings = await Settings.create({
        taxPercentage: 0,
        discountRules: [],
      });
      settings = newSettings.toObject();
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
        // Clear existing rules and add new ones to ensure proper subdocument handling
        settings.discountRules.splice(0, settings.discountRules.length);
        discountRules.forEach((rule: any) => {
          settings.discountRules.push(rule);
        });
        console.log("About to save discountRules:", discountRules);
      }
      await settings.save();
    }

    // Reload from DB to get the saved document with all fields
    const savedSettings = await Settings.findById(settings._id).lean();
    console.log("Updated settings document:", JSON.stringify(savedSettings, null, 2));

    return NextResponse.json({
      success: true,
      data: savedSettings,
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
