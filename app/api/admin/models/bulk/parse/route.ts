import { NextRequest, NextResponse } from "next/server";
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const parseColours = (val: string) => {
      if (!val) return [];
      return String(val)
        .split(/;|,/) // allow ; or , separators
        .map((part) => part.trim())
        .filter(Boolean)
        .map((entry, idx) => {
          const m = entry.match(/^(.*?)\s*\((#?[0-9a-fA-F]{3,8})\)\s*$/);
          if (m) {
            return { id: `color_${idx}_${Date.now()}`, name: m[1].trim(), hex: m[2].startsWith("#") ? m[2] : `#${m[2]}` };
          }
          return { id: `color_${idx}_${Date.now()}`, name: entry, hex: "#000000" };
        });
    };

    const parseVariants = (val: string) => {
      if (!val) return [];
      return String(val).split(/;|,/).map(v => v.trim()).filter(Boolean);
    };

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
            // If the cell says "Price on request" (or similar), treat as 0
            if (/price on request/i.test(pricePart)) {
              return { name, price: 0, raw: pricePart };
            }
            const priceMatch = pricePart.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
            return { name, price, raw: pricePart };
          }
          return { name: entry, price: 0, raw: "" };
        });
    };

    const preview = rows.map((row) => {
      const normalized: Record<string, any> = {};
      for (const key of Object.keys(row)) {
        normalized[key.toString().trim().toLowerCase()] = row[key];
      }
      const name = normalized['model'] || normalized['name'] || '';
      const variants = parseVariants(normalized['variants'] || '');
      const colours = parseColours(normalized['colours'] || normalized['colors'] || '');
      const imageUrl = normalized['imageurl'] || normalized['image'] || '';
      const repairsListRaw = normalized['repairslist'] || normalized['repairs'] || '';
      const repairsParsed = parseRepairs(repairsListRaw);
      // Normalize investigation price: convert numeric strings to numbers, and treat
      // "Price on request" as 0. Empty or unparsable values become empty string.
      const investigationRaw = normalized['investigationprice'] || normalized['investigation price'] || normalized['investigation_price'] || '';
      let investigationPrice: number | string = '';
      if (investigationRaw !== '') {
        const invStr = String(investigationRaw).trim();
        if (/price on request/i.test(invStr)) {
          investigationPrice = 0;
        } else {
          const m = invStr.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)/);
          investigationPrice = m ? Number(m[1]) : '';
        }
      }

      return {
        raw: normalized,
        name,
        variants,
        colours,
        imageUrl,
        repairsParsed,
        investigationPrice,
      };
    });

    return NextResponse.json({ success: true, preview });
  } catch (error: any) {
    console.error('Parse error', error);
    return NextResponse.json({ success: false, error: 'Failed to parse file', details: error.message }, { status: 500 });
  }
}
