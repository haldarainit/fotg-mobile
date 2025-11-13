import mongoose, { Schema, Document } from "mongoose";

export interface IDiscountRule {
  name: string;
  description?: string;
  type: "percentage" | "fixed"; // percentage off or fixed amount off
  value: number; // percentage (e.g., 10 for 10%) or fixed amount (e.g., 50 for $50)
  minRepairs?: number; // minimum number of repairs to qualify
  minSubtotal?: number; // minimum subtotal to qualify
  specificRepairs?: string[]; // specific repair IDs that must be selected (e.g., ["screen", "battery"])
  active: boolean;
  condition?: "minRepairs" | "minSubtotal"; // UI hint; not required for calculation
}

export interface ISettings extends Document {
  taxPercentage: number; // e.g., 8.5 for 8.5% tax
  discountRules: IDiscountRule[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscountRuleSchema = new Schema<IDiscountRule>({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ["percentage", "fixed"], required: true },
  value: { type: Number, required: true, min: 0 },
  minRepairs: { type: Number, min: 1 },
  minSubtotal: { type: Number, min: 0 },
  specificRepairs: [{ type: String }],
  active: { type: Boolean, default: true },
  condition: { type: String, enum: ["minRepairs", "minSubtotal"], required: false },
});

const SettingsSchema = new Schema<ISettings>(
  {
    taxPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountRules: [DiscountRuleSchema],
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
