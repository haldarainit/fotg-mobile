import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  hex: { type: String, required: true },
});

const DeviceModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["smartphone", "tablet", "laptop"],
    },
    image: {
      type: String, // Cloudinary URL
      required: true,
    },
    imagePublicId: {
      type: String, // Cloudinary public ID
      required: true,
    },
    variants: [
      {
        type: String,
        trim: true,
      },
    ],
    colors: [ColorSchema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const DeviceModel =
  mongoose.models.DeviceModel ||
  mongoose.model("DeviceModel", DeviceModelSchema);

export default DeviceModel;
