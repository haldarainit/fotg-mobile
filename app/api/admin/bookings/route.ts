import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import nodemailer from "nodemailer";
import Booking from "@/models/Booking";

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

// GET - Fetch all bookings (admin only)
export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const bookingId = searchParams.get("bookingId");

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (bookingId) {
      query.bookingId = bookingId;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// PUT - Update booking status (admin only)
export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { bookingId, status, note } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: "Booking ID and status are required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).lean() as any;

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Attempt to send notification email to customer (do not fail request if email fails)
    let emailSent = false;
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.HOSTINGER_EMAIL,
          pass: process.env.HOSTINGER_PASSWORD,
        },
      });

      const statusLabel = (status || "updated").toString();
      let subject = `Booking ${booking?.bookingId} status: ${statusLabel}`;
      let html = `
        <div style="font-family: Arial, sans-serif; max-width:700px;margin:0 auto;">
          <h2>Booking Status Updated</h2>
          <p>Your booking for <strong>${booking?.brandName} ${booking?.modelName} (${booking.colorName})</strong> has been updated to <strong>${statusLabel}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Booking ID:</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${booking.bookingId}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Customer:</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${booking.firstName} ${booking.lastName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Device:</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${booking.brandName} ${booking.modelName} (${booking.colorName})</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Service Method:</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${booking.serviceMethod === 'location' ? 'Service at your location' : 'Ship device for repair'}</td></tr>
            ${booking.serviceMethod === 'location' && booking.bookingDate ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Booking Date:</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${new Date(booking.bookingDate).toLocaleDateString()}</td></tr>` : ''}
            ${booking.serviceMethod === 'location' && booking.bookingTimeSlot ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Time Slot:</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${booking.bookingTimeSlot}</td></tr>` : ''}
          </table>

          <h3 style="color:#333;margin:30px 0 15px 0;">Repairs</h3>
          <div style="background:#f8f9fa;padding:15px;border-radius:6px;">
            ${booking.repairs.map((repair: any) => `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>${repair.repairName} ${repair.partQuality ? `(${repair.partQuality.name})` : ''}</span>
                <span style="font-weight:bold;">$${repair.price.toFixed(2)}</span>
              </div>
              <div style="color:#666;font-size:14px;margin-bottom:12px;">Duration: ${repair.duration}</div>
            `).join('')}
          </div>

          <h3 style="color:#333;margin:30px 0 15px 0;">Pricing Summary</h3>
          <div style="background:#f8f9fa;padding:15px;border-radius:6px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span>Subtotal:</span>
              <span>$${booking.pricing.subtotal.toFixed(2)}</span>
            </div>
            ${booking.pricing.discount > 0 ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#059669;">
                <span>Discount${booking.pricing.discountRuleName ? ` (${booking.pricing.discountRuleName})` : ''}:</span>
                <span>-$${booking.pricing.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${booking.pricing.tax > 0 ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>Tax (${booking.pricing.taxPercentage}%):</span>
                <span>$${booking.pricing.tax.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:18px;border-top:2px solid #e5e7eb;padding-top:10px;margin-top:10px;">
              <span>Total:</span>
              <span>$${booking.pricing.total.toFixed(2)}</span>
            </div>
          </div>
      `;

      if (status === "cancelled") {
        subject = `Booking ${booking.bookingId} - Cancelled`;
        html += `
          <p style="color:#b91c1c;font-weight:bold;">Your booking has been cancelled.</p>
        `;
        if (note) {
          html += `
            <div style="background:#fff;padding:12px;border-radius:6px;border:1px solid #eee;margin-top:12px;">
              <strong>Note from admin:</strong>
              <p style="margin:8px 0 0 0;color:#333;white-space:pre-wrap;">${note}</p>
            </div>
          `;
        }
      }

      html += `
          <p style="margin-top:18px;color:#666;">If you have questions, reply to this email or contact support.</p>
        </div>
      `;

      const mailOptions = {
        from: process.env.HOSTINGER_EMAIL,
        to: booking.email,
        subject,
        html,
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
    } catch (e) {
      console.error("Failed to send booking status email:", e);
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Booking status updated successfully",
      emailSent,
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a booking (admin only)
export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}
