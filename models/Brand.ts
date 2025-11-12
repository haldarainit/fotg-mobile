import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL
      required: true,
    },
    logoPublicId: {
      type: String, // Cloudinary public ID for deletion
      required: true,
    },
    deviceTypes: [
      {
        type: String,
        enum: ["smartphone", "tablet", "laptop"],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

export default Brand;
