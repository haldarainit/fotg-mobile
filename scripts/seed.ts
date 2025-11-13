import connectDB from "../lib/mongodb";
import Review from "../models/Review";
import Settings from "../models/Settings";

const seedReviews = [
  {
    name: "Sarah M.",
    email: "sarah@example.com",
    rating: 5,
    device: "iPhone 13 Pro",
    service: "Water Damage Repair",
    review:
      "FOTG Mobile saved my phone after I dropped it in the pool! They had it working perfectly within two days. Highly recommend!",
    createdAt: new Date("2024-11-08"),
    approved: true,
  },
  {
    name: "Rajesh K.",
    email: "rajesh@example.com",
    rating: 5,
    device: "Samsung Galaxy S22",
    service: "Screen Replacement",
    review:
      "Quick, professional, and affordable. My screen looks brand new and the price was way better than I expected.",
    createdAt: new Date("2024-11-03"),
    approved: true,
  },
  {
    name: "Priya S.",
    email: "priya@example.com",
    rating: 5,
    device: "iPhone 12",
    service: "Battery Replacement",
    review:
      "I've used them twice now for different repairs. Always satisfied with the quality and speed of service.",
    createdAt: new Date("2024-10-27"),
    approved: true,
  },
  {
    name: "Michael Johnson",
    email: "michael@example.com",
    rating: 5,
    device: "Google Pixel 7",
    service: "Camera Repair",
    review:
      "My camera was completely broken after a fall. FOTG Mobile fixed it perfectly and now it takes even better photos than before.",
    createdAt: new Date("2024-10-20"),
    approved: true,
  },
  {
    name: "Lisa Chen",
    email: "lisa@example.com",
    rating: 5,
    device: "iPhone 14 Plus",
    service: "Charging Port Repair",
    review:
      "They diagnosed the issue quickly and fixed the charging port the same day. Great communication throughout the process.",
    createdAt: new Date("2024-10-10"),
    approved: true,
  },
  {
    name: "David Rodriguez",
    email: "david@example.com",
    rating: 5,
    device: "Samsung Galaxy A54",
    service: "Screen & Back Glass",
    review:
      "Professional service and fair pricing. They even cleaned the inside while they had it open. Phone looks brand new now.",
    createdAt: new Date("2024-10-10"),
    approved: true,
  },
];

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing reviews
    await Review.deleteMany({});
    console.log("Cleared existing reviews");

    // Insert seed reviews
    await Review.insertMany(seedReviews);
    console.log("Seed reviews inserted successfully");

    // Display count
    const count = await Review.countDocuments();
    console.log(`Total reviews in database: ${count}`);

    // Initialize default settings if not exists
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        taxPercentage: 0,
        discountRules: [],
      });
      console.log("Default settings initialized");
    } else {
      console.log("Settings already exist");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
