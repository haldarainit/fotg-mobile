import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";

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

// GET - Fetch all brands
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

    const brands = await Brand.find(query).sort({ name: 1 }).lean();

    console.log(`Fetched ${brands.length} brands`);

    return NextResponse.json({
      success: true,
      data: brands,
      brands: brands, // For backwards compatibility
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST - Create a new brand
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    console.log("Received brand data:", body);
    
    const { name, logo, logoPublicId, deviceTypes, active } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Brand name is required" },
        { status: 400 }
      );
    }

    if (!logo || !logo.trim()) {
      return NextResponse.json(
        { success: false, error: "Brand logo is required" },
        { status: 400 }
      );
    }

    if (!logoPublicId || !logoPublicId.trim()) {
      return NextResponse.json(
        { success: false, error: "Logo public ID is required" },
        { status: 400 }
      );
    }

    if (!deviceTypes || !Array.isArray(deviceTypes) || deviceTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one device type is required" },
        { status: 400 }
      );
    }

    const brand = await Brand.create({
      name: name.trim(),
      logo,
      logoPublicId,
      deviceTypes,
      active: active !== undefined ? active : true,
    });

    console.log("Brand created successfully:", brand);

    return NextResponse.json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand" },
      { status: 500 }
    );
  }
}

// PATCH - Update a brand
export async function PATCH(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { id, name, logo, logoPublicId, deviceTypes, active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Brand ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo;
    if (logoPublicId !== undefined) updateData.logoPublicId = logoPublicId;
    if (deviceTypes !== undefined) updateData.deviceTypes = deviceTypes;
    if (active !== undefined) updateData.active = active;

    const brand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a brand
export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Brand ID is required" },
        { status: 400 }
      );
    }

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
