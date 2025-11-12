import mongoose from "mongoose";

const PartQualityOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const RepairItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional machine-friendly identifier. If not provided, auto-generate one.
    repairId: {
      type: String,
      required: false,
      unique: true,
      default: () => `repair_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
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
