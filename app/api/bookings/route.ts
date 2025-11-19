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

    // Determine day of week in configured timezone
    const TZ = process.env.TIMEZONE || "America/Chicago";
    const weekdayShort = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date(date + 'T12:00:00'));
    const dayMap: any = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dayOfWeek = dayMap[weekdayShort as keyof typeof dayMap];

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

    // Use timezone-aware bookingDateKey
    const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(date + 'T12:00:00'));
    // Support legacy bookings without bookingDateKey by matching either the key or the date range
    const startOfDayFallback = new Date(date);
    startOfDayFallback.setHours(0, 0, 0, 0);
    const endOfDayFallback = new Date(date);
    endOfDayFallback.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      serviceMethod: "location",
      status: { $ne: "cancelled" },
      $or: [
        { bookingDateKey: dateKey },
        { bookingDate: { $gte: startOfDayFallback, $lte: endOfDayFallback } },
      ],
    }).lean();

    // Get booked time slots (using the slot label as identifier)
    const bookedSlots = bookings.map((booking) => booking.bookingTimeSlot).filter(Boolean);

    // Helper function to check if a time slot is in the past or currently in progress (using US Central timezone)
    const isTimeSlotPast = (date: string, slot: any): boolean => {
      // Get current time in US Central timezone
      const now = new Date();
      const nowInTZ = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
      
      // Parse start and end times (format: "HH:MM")
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      
      // Create start and end Date objects for the slot in US Central timezone
      const slotStartDateTimeStr = `${date}T${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;
      const slotEndDateTimeStr = `${date}T${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
      
      const slotStartInTZ = new Date(new Date(slotStartDateTimeStr).toLocaleString("en-US", { timeZone: TZ }));
      const slotEndInTZ = new Date(new Date(slotEndDateTimeStr).toLocaleString("en-US", { timeZone: TZ }));
      
      // A slot is past if current time is at or after the slot start time
      // This means slots that have started (in progress or completed) are considered past/unavailable
      return nowInTZ >= slotStartInTZ;
    };

    // Create slots with availability status
    const allSlotsWithAvailability = activeSlots.map((slot: any) => ({
      ...slot,
      isAvailable: !bookedSlots.includes(slot.label),
      isBooked: bookedSlots.includes(slot.label),
      isPast: isTimeSlotPast(date, slot),
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
    const TZ = process.env.TIMEZONE || "America/Chicago";

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

      const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(bookingDate));
      const startOfDayFallback = new Date(bookingDate);
      startOfDayFallback.setHours(0, 0, 0, 0);
      const endOfDayFallback = new Date(bookingDate);
      endOfDayFallback.setHours(23, 59, 59, 999);

      const existingBooking = await Booking.findOne({
        bookingTimeSlot,
        serviceMethod: "location",
        status: { $ne: "cancelled" },
        $or: [
          { bookingDateKey: dateKey },
          { bookingDate: { $gte: startOfDayFallback, $lte: endOfDayFallback } },
        ],
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

    // Create booking (include timezone-aware date key)
    const bookingDateKey = serviceMethod === "location" && bookingDate
      ? new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(bookingDate))
      : undefined;

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
      bookingDateKey,
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
