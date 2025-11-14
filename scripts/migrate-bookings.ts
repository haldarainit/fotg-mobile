import connectDB from "../lib/mongodb";
import Booking from "../models/Booking";

async function migrateBookings() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Find all bookings without bookingId
    const bookingsWithoutId = await Booking.find({ bookingId: { $exists: false } });
    console.log(`Found ${bookingsWithoutId.length} bookings without bookingId`);

    for (const booking of bookingsWithoutId) {
      // Generate a unique booking ID
      const generateBookingId = () => {
        const prefix = "BK-";
        const rand = Math.floor(Math.random() * 900000) + 100000; // 6 digits
        return prefix + rand;
      };

      let bookingId = generateBookingId();
      let attempts = 0;
      while (await Booking.findOne({ bookingId }) && attempts < 5) {
        bookingId = generateBookingId();
        attempts++;
      }

      // Update the booking
      await Booking.updateOne({ _id: booking._id }, { bookingId });
      console.log(`Updated booking ${booking._id} with bookingId ${bookingId}`);
    }

    console.log("Migration completed");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateBookings();