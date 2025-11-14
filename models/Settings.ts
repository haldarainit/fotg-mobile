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

export interface ITimeSlot {
  id: string;
  label: string; // e.g., "9:00 AM - 10:00 AM"
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:00"
  active: boolean;
}

export interface ISettings extends Document {
  taxPercentage: number; // e.g., 8.5 for 8.5% tax
  discountRules: IDiscountRule[];
  timeSlots: ITimeSlot[];
  operatingDays: number[]; // 0-6, Sunday=0, e.g., [1,2,3,4,5] for weekdays
  closedDates: string[]; // array of date strings in YYYY-MM-DD format
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

const TimeSlotSchema = new Schema<ITimeSlot>({
  id: { type: String, required: true },
  label: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  active: { type: Boolean, default: true },
});

const SettingsSchema = new Schema<ISettings>(
  {
    taxPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountRules: [DiscountRuleSchema],
    timeSlots: { type: [TimeSlotSchema], default: [] },
    operatingDays: { type: [Number], default: [1, 2, 3, 4, 5], validate: {
      validator: (v: number[]) => v.every(day => day >= 0 && day <= 6),
      message: 'Operating days must be between 0 (Sunday) and 6 (Saturday)'
    }},
    closedDates: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
