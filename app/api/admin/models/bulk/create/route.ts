import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DeviceModel from "@/models/DeviceModel";
import RepairItem from "@/models/RepairItem";

async function uploadToCloudinary(imageUrl: string) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;

    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${b64}`;

    const form = new FormData();
    form.append('file', dataUri);
    form.append('upload_preset', uploadPreset);
    form.append('folder', 'models');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    if (!uploadRes.ok) return null;
    const uploadJson = await uploadRes.json();
    return { url: uploadJson.secure_url, publicId: uploadJson.public_id };
  } catch (err) {
    console.error('Cloudinary upload failed', err);
    return null;
  }
}

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

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();
    const rows = body.rows || [];
    const brandId = body.brandId;
    const deviceType = body.deviceType || 'smartphone';

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No rows provided' }, { status: 400 });
    }
    if (!brandId) {
      return NextResponse.json({ success: false, error: 'brandId is required' }, { status: 400 });
    }

    const created: any[] = [];
    const errors: any[] = [];
    const skipped: any[] = [];
    const analysis: Array<{ action: 'create' | 'skip' | 'error'; reason?: string; existingId?: string }> = [];

    const dryRun = body.dryRun === true;

    const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const makeNamePattern = (s: string) => {
      const trimmed = (s || '').toString().trim();
      const escaped = escapeForRegex(trimmed);
      return escaped.replace(/\s+/g, '\\s+');
    };

    for (const r of rows) {
      try {
        const name = (r.name || '').toString().trim();
        if (!name) {
          errors.push({ row: r, error: 'Missing model name' });
          continue;
        }
        // Skip creating duplicate models for the same brand + deviceType (case/space-insensitive)
        const existingModel = await DeviceModel.findOne({ name: new RegExp(`^${makeNamePattern(name)}$`, 'i'), brandId, deviceType }).lean();
        if (existingModel) {
          const existingId = Array.isArray(existingModel) ? (existingModel[0] as any)?._id : (existingModel as any)?._id;
          analysis.push({ action: 'skip', reason: 'Model already exists', existingId });
          skipped.push({ name, reason: 'Model already exists for this brand/deviceType', id: existingId });
          continue;
        }

        const variants = Array.isArray(r.variants) ? r.variants : [];
        const colours = Array.isArray(r.colours) ? r.colours : [];
        // Use provided image URL or generate a lightweight placeholder so model
        // validation (which requires `image` and `imagePublicId`) passes.
        const providedImageUrl = (r.imageUrl || '').toString().trim();
        const imageUrl = providedImageUrl || `https://placehold.co/400x400?text=${encodeURIComponent(name)}`;
        const repairsParsed = Array.isArray(r.repairsParsed) ? r.repairsParsed : [];
        const modelRepairs: any[] = [];
        // dedupe repairs within the row (normalize by collapsing spaces and lowercasing)
        const seenRepairs = new Set<string>();
        for (const rp of repairsParsed) {
          const rawName = (rp.name || '').toString();
          const normKey = rawName.replace(/\s+/g, ' ').trim().toLowerCase();
          if (!normKey || seenRepairs.has(normKey)) continue;
          seenRepairs.add(normKey);

          // Build a forgiving regex that tolerates different whitespace and case
          const pattern = makeNamePattern(rawName);
          const repairDoc = await RepairItem.findOne({ name: new RegExp(`^${pattern}$`, 'i') }).lean();
          const basePrice = (typeof rp.price !== 'undefined' && rp.price !== null) ? Number(rp.price) || 0 : 0;
          if (repairDoc) {
            modelRepairs.push({ repairId: repairDoc._id, basePrice, qualityPrices: [] });
          } else {
            modelRepairs.push({ repairId: null, basePrice, qualityPrices: [], note: rp.name });
          }
        }

        // handle investigationPrice if present (including 0 / "Price on request")
        const hasInvestigationPrice = typeof r.investigationPrice !== 'undefined' && r.investigationPrice !== '' && r.investigationPrice !== null;
        if (hasInvestigationPrice && !repairsParsed.some((x: any) => /investigation/i.test(x.name))) {
          const inv = await RepairItem.findOne({ name: /investigation/i }).lean();
          const invPriceVal = Number(r.investigationPrice) || 0;
          if (inv) modelRepairs.push({ repairId: inv._id, basePrice: invPriceVal, qualityPrices: [] });
          else modelRepairs.push({ repairId: null, basePrice: invPriceVal, qualityPrices: [], note: 'Investigation' });
        }

        const modelObj: any = {
          name,
          brandId,
          deviceType,
          image: imageUrl,
          imagePublicId: providedImageUrl || `bulk_${Date.now()}`,
          variants,
          colors: colours,
          repairs: modelRepairs,
          active: true,
        };

        // If dryRun, record intent but do not create documents or upload images
        if (dryRun) {
          analysis.push({ action: 'create' });
          continue;
        }

        // For real create: attempt to upload provided image to Cloudinary (if configured)
        if (providedImageUrl) {
          try {
            const uploaded = await uploadToCloudinary(providedImageUrl);
            if (uploaded) {
              modelObj.image = uploaded.url;
              modelObj.imagePublicId = uploaded.publicId;
            }
          } catch (err) {
            console.error('Image upload error for', providedImageUrl, err);
          }
        }

        const createdModel = await DeviceModel.create(modelObj);
        created.push({ name, id: createdModel._id });
        analysis.push({ action: 'create' });
      } catch (err) {
        console.error('Create row error', err);
        analysis.push({ action: 'error', reason: (err as any).message || String(err) });
        errors.push({ row: r, error: (err as any).message || String(err) });
      }
    }

    if (dryRun) {
      return NextResponse.json({ success: true, dryRun: true, analysis, created: [], skipped, errors });
    }

    return NextResponse.json({ success: true, created, skipped, errors, analysis });
  } catch (error: any) {
    console.error('Bulk create error', error);
    return NextResponse.json({ success: false, error: 'Bulk create failed', details: error.message }, { status: 500 });
  }
}
