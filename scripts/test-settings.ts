import connectDB from "../lib/mongodb";
import Settings from "../models/Settings";

async function cleanupTestData() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Remove test time slots and reset to empty arrays
    const settings = await Settings.findOne();

    if (settings) {
      settings.timeSlots = [];
      settings.operatingDays = [1, 2, 3, 4, 5]; // Default weekdays
      settings.closedDates = [];
      await settings.save();

      console.log("Test data cleaned up successfully");
    } else {
      console.log("No settings document found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanupTestData();