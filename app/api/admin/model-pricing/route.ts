import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ModelRepairPricing from "@/models/ModelRepairPricing";

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

// GET - Fetch pricing for a model
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");

    if (!modelId) {
      return NextResponse.json(
        { success: false, error: "Model ID is required" },
        { status: 400 }
      );
    }

    const pricing = await ModelRepairPricing.find({ modelId, active: true })
      .populate("repairItemId")
      .lean();

    return NextResponse.json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pricing" },
      { status: 500 }
    );
  }
}

// POST - Create or update pricing for a model
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { modelId, repairItemId, price, duration } = body;

    if (!modelId || !repairItemId || !price || !duration) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Upsert pricing
    const pricing = await ModelRepairPricing.findOneAndUpdate(
      { modelId, repairItemId },
      { price, duration, active: true },
      { new: true, upsert: true }
    ).populate("repairItemId");

    return NextResponse.json({
      success: true,
      message: "Pricing saved successfully",
      data: pricing,
    });
  } catch (error) {
    console.error("Error saving pricing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save pricing" },
      { status: 500 }
    );
  }
}

// DELETE - Remove pricing
export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Pricing ID is required" },
        { status: 400 }
      );
    }

    await ModelRepairPricing.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Pricing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pricing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete pricing" },
      { status: 500 }
    );
  }
}
