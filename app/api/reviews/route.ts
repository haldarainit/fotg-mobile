import { NextRequest, NextResponse } from "next/server";
import { formatDate } from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Review, { IReview } from "@/models/Review";

// GET - Fetch all approved reviews
export async function GET() {
  try {
    await connectDB();

    const reviews = await Review.find({ approved: true })
      .sort({ createdAt: -1 })
      .lean();

    const reviewsWithFormattedDate = reviews.map((review: any) => ({
      ...review,
      id: review._id.toString(),
      date: formatDate(new Date(review.createdAt)),
    }));

    return NextResponse.json({
      success: true,
      data: reviewsWithFormattedDate,
      total: reviewsWithFormattedDate.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Add a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, rating, device, service, review } = body;

    // Validation
    if (!name || !email || !rating || !device || !service || !review) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user has already submitted a review in the last 24 hours
    const existingReview = await Review.findOne({
      email,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You can only submit one review per day" },
        { status: 429 }
      );
    }

    // Create new review
    const newReview = new Review({
      name,
      email,
      rating,
      device,
      service,
      review,
      approved: true, // Auto-approve for demo (in production, you might want moderation)
    });

    const savedReview = await newReview.save();

    const reviewWithFormattedDate = {
      ...savedReview.toObject(),
      id: savedReview._id.toString(),
      date: formatDate(savedReview.createdAt),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Review added successfully",
        data: reviewWithFormattedDate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding review:", error);

    // Handle MongoDB validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: "Please check your input data" },
        { status: 400 }
      );
    }

    // Handle duplicate key error (multiple reviews within 24 hours)
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "You can only submit one review per day" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to add review" },
      { status: 500 }
    );
  }
}
