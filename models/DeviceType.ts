import mongoose from "mongoose";

const DeviceTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["smartphone", "tablet", "laptop"],
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const DeviceType =
  mongoose.models.DeviceType ||
  mongoose.model("DeviceType", DeviceTypeSchema);

export default DeviceType;
