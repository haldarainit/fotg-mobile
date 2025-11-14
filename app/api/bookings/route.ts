import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Settings from "@/models/Settings";

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

    // Fetch settings
    const settings = await Settings.findOne().lean() as any;
    const timeSlots = settings?.timeSlots || [];
    const operatingDays = settings?.operatingDays || [1, 2, 3, 4, 5];
    const closedDates = settings?.closedDates || [];

    // Check if date is in closed dates
    if (closedDates.includes(date)) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          availableSlots: [],
          bookedSlots: [],
          message: "Store is closed on this date",
        },
      });
    }

    // Check if the day is operational
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

    if (!operatingDays.includes(dayOfWeek)) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          availableSlots: [],
          bookedSlots: [],
          message: "No slots available on this day",
        },
      });
    }

    // Get active time slots
    const activeSlots = timeSlots.filter((slot: any) => slot.active);

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

    // Get booked time slots (using the slot label as identifier)
    const bookedSlots = bookings.map((booking) => booking.bookingTimeSlot).filter(Boolean);

    // Create slots with availability status
    const allSlotsWithAvailability = activeSlots.map((slot: any) => ({
      ...slot,
      isAvailable: !bookedSlots.includes(slot.label),
      isBooked: bookedSlots.includes(slot.label),
    }));

    // Filter out booked slots to get available slots (for backward compatibility)
    const availableSlots = activeSlots.filter((slot: any) => !bookedSlots.includes(slot.label)).map((slot: any) => slot.label);

    return NextResponse.json({
      success: true,
      data: {
        date,
        availableSlots,
        bookedSlots,
        timeSlots: activeSlots,
        allSlots: allSlotsWithAvailability, // New: all slots with availability status
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

    // Generate a unique booking ID like 'BK-' + 6 digits
    const generateBookingId = () => {
      const prefix = "BK-";
      const rand = Math.floor(Math.random() * 900000) + 100000; // 6 digits
      return prefix + rand;
    };

    let bookingId = generateBookingId();
    // Ensure uniqueness for bookingId
    let attempts = 0;
    while (await Booking.findOne({ bookingId }) && attempts < 5) {
      bookingId = generateBookingId();
      attempts++;
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
      bookingId,
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
