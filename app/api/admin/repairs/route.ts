import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RepairItem from "@/models/RepairItem";

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

// GET - Fetch all repair items
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const deviceType = searchParams.get("deviceType");
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query: any = {};
    
    if (activeOnly) {
      query.active = true;
    }
    
    if (deviceType) {
      query.deviceTypes = deviceType;
    }

    const repairs = await RepairItem.find(query).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: repairs,
    });
  } catch (error) {
    console.error("Error fetching repair items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch repair items" },
      { status: 500 }
    );
  }
}

// POST - Create a new repair item
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { 
      name, 
      repairId, 
      icon, 
      deviceTypes, 
      basePrice, 
      duration,
      hasQualityOptions,
      qualityOptions 
    } = body;

    if (!name || !repairId || !icon || !deviceTypes || deviceTypes.length === 0 || !duration) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const repair = await RepairItem.create({
      name,
      repairId,
      icon,
      deviceTypes,
      basePrice: basePrice || 0,
      duration,
      hasQualityOptions: hasQualityOptions || false,
      qualityOptions: qualityOptions || [],
    });

    return NextResponse.json({
      success: true,
      message: "Repair item created successfully",
      data: repair,
    });
  } catch (error) {
    console.error("Error creating repair item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create repair item" },
      { status: 500 }
    );
  }
}

// PATCH - Update a repair item
export async function PATCH(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { 
      id, 
      name, 
      icon, 
      deviceTypes, 
      basePrice, 
      duration,
      hasQualityOptions,
      qualityOptions,
      active 
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Repair item ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (deviceTypes !== undefined) updateData.deviceTypes = deviceTypes;
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (duration !== undefined) updateData.duration = duration;
    if (hasQualityOptions !== undefined) updateData.hasQualityOptions = hasQualityOptions;
    if (qualityOptions !== undefined) updateData.qualityOptions = qualityOptions;
    if (active !== undefined) updateData.active = active;

    const repair = await RepairItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!repair) {
      return NextResponse.json(
        { success: false, error: "Repair item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Repair item updated successfully",
      data: repair,
    });
  } catch (error) {
    console.error("Error updating repair item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update repair item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a repair item
export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Repair item ID is required" },
        { status: 400 }
      );
    }

    const repair = await RepairItem.findByIdAndDelete(id);

    if (!repair) {
      return NextResponse.json(
        { success: false, error: "Repair item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Repair item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting repair item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete repair item" },
      { status: 500 }
    );
  }
}
