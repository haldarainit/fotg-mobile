import mongoose from "mongoose";

const ModelRepairPricingSchema = new mongoose.Schema(
  {
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeviceModel",
      required: true,
    },
    repairItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairItem",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
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

// Compound index to ensure unique pricing per model-repair combination
ModelRepairPricingSchema.index({ modelId: 1, repairItemId: 1 }, { unique: true });

const ModelRepairPricing =
  mongoose.models.ModelRepairPricing ||
  mongoose.model("ModelRepairPricing", ModelRepairPricingSchema);

export default ModelRepairPricing;
