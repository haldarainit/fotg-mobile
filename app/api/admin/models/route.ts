import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DeviceModel from "@/models/DeviceModel";

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

// GET - Fetch all device models
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const deviceType = searchParams.get("deviceType");
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query: any = {};
    
    if (activeOnly) {
      query.active = true;
    }
    
    if (brandId) {
      query.brandId = brandId;
    }
    
    if (deviceType) {
      query.deviceType = deviceType;
    }

    const models = await DeviceModel.find(query)
      .populate("brandId", "name logo")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

// POST - Create a new device model
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { name, brandId, deviceType, image, imagePublicId, variants, colors } = body;

    if (!name || !brandId || !deviceType || !image || !imagePublicId) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const model = await DeviceModel.create({
      name,
      brandId,
      deviceType,
      image,
      imagePublicId,
      variants: variants || [],
      colors: colors || [],
    });

    const populatedModel = await DeviceModel.findById(model._id)
      .populate("brandId", "name logo");

    return NextResponse.json({
      success: true,
      message: "Device model created successfully",
      data: populatedModel,
    });
  } catch (error) {
    console.error("Error creating model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create model" },
      { status: 500 }
    );
  }
}

// PATCH - Update a device model
export async function PATCH(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { id, name, image, imagePublicId, variants, colors, active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Model ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId;
    if (variants !== undefined) updateData.variants = variants;
    if (colors !== undefined) updateData.colors = colors;
    if (active !== undefined) updateData.active = active;

    const model = await DeviceModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("brandId", "name logo");

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Model updated successfully",
      data: model,
    });
  } catch (error) {
    console.error("Error updating model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update model" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a device model
export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Model ID is required" },
        { status: 400 }
      );
    }

    const model = await DeviceModel.findByIdAndDelete(id);

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Model deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
