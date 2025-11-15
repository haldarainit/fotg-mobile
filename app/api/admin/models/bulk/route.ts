import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DeviceModel from "@/models/DeviceModel";
import RepairItem from "@/models/RepairItem";
import Brand from "@/models/Brand";
import * as XLSX from "xlsx";

// Middleware to check authentication (reuse same cookie check)
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const brandId = formData.get("brandId") as string | null;
    const deviceType = (formData.get("deviceType") as string) || "smartphone";

    if (!file) {
      return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
    }

    if (!brandId) {
      return NextResponse.json({ success: false, error: "brandId is required" }, { status: 400 });
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Helper to parse colours string: "Black (#262529); Green (#afe28a)"
    const parseColours = (val: string) => {
      if (!val) return [];
      return String(val)
        .split(/;|,/) // allow ; or , separators
        .map((part) => part.trim())
        .filter(Boolean)
        .map((entry, idx) => {
          // Try to extract name and hex
          const m = entry.match(/^(.*?)\s*\((#?[0-9a-fA-F]{3,8})\)\s*$/);
          if (m) {
            return { id: `color_${idx}_${Date.now()}`, name: m[1].trim(), hex: m[2].startsWith("#") ? m[2] : `#${m[2]}` };
          }
          // fallback: whole entry is name
          return { id: `color_${idx}_${Date.now()}`, name: entry, hex: "#000000" };
        });
    };

    // Helper to parse variants: split by ; or ,
    const parseVariants = (val: string) => {
      if (!val) return [];
      return String(val).split(/;|,/).map(v => v.trim()).filter(Boolean);
    };

    // Helper to parse repairs list: entries like "Investigation ($30)" or "Screen (Price on request)"
    const parseRepairs = (val: string) => {
      if (!val) return [];
      return String(val)
        .split(/,/) // repairs likely comma-separated
        .map(s => s.trim())
        .filter(Boolean)
        .map(entry => {
          const m = entry.match(/^(.*?)\s*\((.*?)\)\s*$/);
          if (m) {
            const name = m[1].trim();
            const pricePart = m[2].trim();
            const priceMatch = pricePart.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
            return { name, price, raw: pricePart };
          }
          return { name: entry, price: 0, raw: "" };
        });
    };

    const created: any[] = [];
    const errors: any[] = [];

    for (const row of rows) {
      try {
        // Normalize keys (some sheets may have different header casing)
        const normalized: Record<string, any> = {};
        for (const key of Object.keys(row)) {
          normalized[key.toString().trim().toLowerCase()] = row[key];
        }

        const name = normalized['model'] || normalized['name'];
        if (!name) {
          errors.push({ row, error: 'Model name missing' });
          continue;
        }

        const variants = parseVariants(normalized['variants'] || '');
        const colours = parseColours(normalized['colours'] || normalized['colors'] || '');
        const imageUrl = normalized['imageurl'] || normalized['image'] || '';
        const repairsListRaw = normalized['repairslist'] || normalized['repairs'] || '';
        const repairsParsed = parseRepairs(repairsListRaw);

        const modelRepairs: any[] = [];
        for (const rp of repairsParsed) {
          // find repair item by name (case-insensitive)
          const repairDoc = await RepairItem.findOne({ name: new RegExp(`^${rp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}$`, 'i') }).lean();
          if (repairDoc) {
            modelRepairs.push({ repairId: repairDoc._id, basePrice: rp.price || 0, qualityPrices: [] });
          } else {
            // If repair not found, skip or create a placeholder repair? We'll skip but record.
            // The user asked not to lose data, so include an entry with repairId set to null and name in description
            modelRepairs.push({ repairId: null, basePrice: rp.price || 0, qualityPrices: [], note: rp.name });
          }
        }

        // Additional column like InvestigationPrice
        const investigationPrice = normalized['investigationprice'] || normalized['investigation price'] || normalized['investigation_price'] || '';
        if (investigationPrice && !repairsParsed.some(r=>/investigation/i.test(r.name))) {
          // try to find repair named Investigation and add
          const invRepair = await RepairItem.findOne({ name: /investigation/i }).lean();
          if (invRepair) {
            modelRepairs.push({ repairId: invRepair._id, basePrice: Number(investigationPrice) || 0, qualityPrices: [] });
          } else if (investigationPrice) {
            modelRepairs.push({ repairId: null, basePrice: Number(investigationPrice) || 0, qualityPrices: [], note: 'Investigation' });
          }
        }

        // Build model object
        const modelObj: any = {
          name: String(name).trim(),
          brandId,
          deviceType: deviceType || 'smartphone',
          image: String(imageUrl).trim() || '',
          imagePublicId: String(imageUrl).trim() || `bulk_${Date.now()}`,
          variants,
          colors: colours,
          repairs: modelRepairs,
          active: true,
        };

        const createdModel = await DeviceModel.create(modelObj);
        created.push({ row: normalized, id: createdModel._id });
      } catch (err) {
        console.error('Row import error', err);
        errors.push({ row, error: (err as any).message || String(err) });
      }
    }

    return NextResponse.json({ success: true, created, errors });
  } catch (error: any) {
    console.error('Bulk upload error', error);
    return NextResponse.json({ success: false, error: 'Bulk upload failed', details: error.message }, { status: 500 });
  }
}
