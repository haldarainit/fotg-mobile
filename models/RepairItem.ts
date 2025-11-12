import mongoose from "mongoose";

const PartQualityOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  priceMultiplier: { type: Number, required: true, default: 1.0 },
});

const RepairItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    repairId: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      required: true,
    },
    deviceTypes: [
      {
        type: String,
        enum: ["smartphone", "tablet", "laptop"],
      },
    ],
    basePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    // Part quality options (optional)
    hasQualityOptions: {
      type: Boolean,
      default: false,
    },
    qualityOptions: [PartQualityOptionSchema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const RepairItem =
  mongoose.models.RepairItem ||
  mongoose.model("RepairItem", RepairItemSchema);

export default RepairItem;
