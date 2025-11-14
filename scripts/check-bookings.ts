import connectDB from "../lib/mongodb";
import Booking from "../models/Booking";

async function checkBookings() {
  try {
    await connectDB();
    console.log('Connected to database');

    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(5).lean();
    console.log('Recent bookings:', JSON.stringify(bookings, null, 2));

    console.log('Total bookings count:', await Booking.countDocuments());
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkBookings();