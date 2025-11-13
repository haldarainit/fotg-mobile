import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

// GET - Get available time slots for a specific date
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Date is required" },
        { status: 400 }
      );
    }

    // Get all bookings for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      serviceMethod: "location",
      status: { $ne: "cancelled" },
    }).lean();

    // Return booked time slots
    const bookedSlots = bookings.map((booking) => booking.bookingTimeSlot).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        date,
        bookedSlots,
      },
    });
  } catch (error: any) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      customerType,
      deviceType,
      brand,
      model,
      color,
      serviceMethod,
      bookingDate,
      bookingTimeSlot,
      shippingAddress,
      repairs,
      pricing,
      notes,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !serviceMethod) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If service method is location, validate booking date and time
    if (serviceMethod === "location") {
      if (!bookingDate || !bookingTimeSlot) {
        return NextResponse.json(
          { success: false, error: "Booking date and time slot are required for location service" },
          { status: 400 }
        );
      }

      // Check if the time slot is already booked
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBooking = await Booking.findOne({
        bookingDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        bookingTimeSlot,
        serviceMethod: "location",
        status: { $ne: "cancelled" },
      });

      if (existingBooking) {
        return NextResponse.json(
          { 
            success: false, 
            error: "This time slot is already booked. Please select another time." 
          },
          { status: 409 }
        );
      }
    }

    // Create booking
    const booking = await Booking.create({
      firstName,
      lastName,
      email,
      phone,
      customerType: customerType || "private",
      deviceType,
      brandId: brand?.id,
      brandName: brand?.name,
      modelId: model?.id,
      modelName: model?.name,
      colorId: color?.id,
      colorName: color?.name,
      serviceMethod,
      bookingDate: serviceMethod === "location" ? new Date(bookingDate) : undefined,
      bookingTimeSlot: serviceMethod === "location" ? bookingTimeSlot : undefined,
      shippingAddress: serviceMethod === "pickup" ? shippingAddress : undefined,
      repairs,
      pricing,
      notes,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
