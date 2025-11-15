import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DeviceModel from "@/models/DeviceModel";
import RepairItem from "@/models/RepairItem";
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

// GET - Fetch all device models
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const deviceType = searchParams.get("deviceType");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("activeOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

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

    // Text search across model name and variants
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { name: { $regex: regex } },
        { variants: { $elemMatch: { $regex: regex } } },
      ];
    }

    // Get total count for pagination
    const total = await DeviceModel.countDocuments(query);

    const models = await DeviceModel.find(query)
      .populate("brandId", "name logo")
      .populate({ 
        path: "repairs.repairId", 
        model: RepairItem, 
        select: "name basePrice hasQualityOptions qualityOptions" 
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Enrich quality prices with details from repair quality options
    const enrichedModels = models.map((model: any) => {
      if (model.repairs && model.repairs.length > 0) {
        // Filter out repairs where repairId is null (deleted repairs)
        model.repairs = model.repairs
          .filter((repair: any) => repair.repairId != null)
          .map((repair: any) => {
            if (repair.qualityPrices && repair.qualityPrices.length > 0 && repair.repairId) {
              const repairItem = repair.repairId;
              if (repairItem && repairItem.qualityOptions && Array.isArray(repairItem.qualityOptions)) {
                repair.qualityPrices = repair.qualityPrices
                  .filter((qp: any) => qp != null && qp.id != null)
                  .map((qp: any) => {
                    const qualityOption = repairItem.qualityOptions.find((qo: any) => qo && qo.id === qp.id);
                    if (qualityOption) {
                      return {
                        ...qp,
                        name: qualityOption.name || qp.name,
                        description: qualityOption.description,
                        duration: repairItem.duration,
                      };
                    }
                    return qp;
                  });
              }
            }
            return repair;
          });
      }
      return model;
    });

    console.log(`Fetched ${enrichedModels.length} models (page ${page} of ${Math.ceil(total / limit)})`);

    return NextResponse.json({
      success: true,
      data: enrichedModels,
      models: enrichedModels, // For backwards compatibility
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + enrichedModels.length < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch models",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
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
    console.log("Received model data:", body);
    
    const { name, brandId, deviceType, image, imagePublicId, variants, colors, active } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Model name is required" },
        { status: 400 }
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: "Brand is required" },
        { status: 400 }
      );
    }

    if (!deviceType) {
      return NextResponse.json(
        { success: false, error: "Device type is required" },
        { status: 400 }
      );
    }

    if (!image || !image.trim()) {
      return NextResponse.json(
        { success: false, error: "Model image is required" },
        { status: 400 }
      );
    }

    if (!imagePublicId || !imagePublicId.trim()) {
      return NextResponse.json(
        { success: false, error: "Image public ID is required" },
        { status: 400 }
      );
    }

    const model = await DeviceModel.create({
      name: name.trim(),
      brandId,
      deviceType,
      image,
      imagePublicId,
      variants: variants || [],
      colors: colors || [],
      repairs: body.repairs || [],
      active: active !== undefined ? active : true,
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
  const { id, name, image, imagePublicId, variants, colors, repairs, active } = body;

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
  if (repairs !== undefined) updateData.repairs = repairs;
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
