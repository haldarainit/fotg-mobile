import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  name: string;
  email: string;
  rating: number;
  device: string;
  service: string;
  review: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    device: {
      type: String,
      required: [true, "Device is required"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Service type is required"],
      trim: true,
    },
    review: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [1000, "Review must be less than 1000 characters"],
    },
    approved: {
      type: Boolean,
      default: true, // Auto-approve for demo, set to false for moderation
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
ReviewSchema.index({ approved: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ email: 1 });

// Prevent duplicate reviews from the same email within 24 hours
ReviewSchema.index(
  { email: 1, createdAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  }
);

const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
