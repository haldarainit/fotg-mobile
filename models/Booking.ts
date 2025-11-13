import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  // Customer Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerType: "private" | "business";
  
  // Device Information
  deviceType: string;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  colorId: string;
  colorName: string;
  
  // Service Details
  serviceMethod: "location" | "pickup";
  bookingDate?: Date; // For location service
  bookingTimeSlot?: string; // For location service (e.g., "9:00 am - 11:00 am")
  
  // Shipping Address (for pickup service)
  shippingAddress?: {
    houseNumber: string;
    streetName: string;
    city: string;
    zipcode: string;
    country: string;
  };
  
  // Repairs
  repairs: Array<{
    repairId: string;
    repairName: string;
    price: number;
    duration: string;
    partQuality?: {
      id: string;
      name: string;
    };
  }>;
  
  // Pricing
  pricing: {
    subtotal: number;
    discount: number;
    discountRuleName?: string;
    tax: number;
    taxPercentage: number;
    total: number;
  };
  
  // Additional
  notes?: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    // Customer Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    customerType: { 
      type: String, 
      enum: ["private", "business"], 
      required: true 
    },
    
    // Device Information
    deviceType: { type: String, required: true },
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    modelId: { type: String, required: true },
    modelName: { type: String, required: true },
    colorId: { type: String, required: true },
    colorName: { type: String, required: true },
    
    // Service Details
    serviceMethod: { 
      type: String, 
      enum: ["location", "pickup"], 
      required: true 
    },
    bookingDate: { type: Date },
    bookingTimeSlot: { type: String },
    
    // Shipping Address
    shippingAddress: {
      houseNumber: { type: String },
      streetName: { type: String },
      city: { type: String },
      zipcode: { type: String },
      country: { type: String },
    },
    
    // Repairs
    repairs: [
      {
        repairId: { type: String, required: true },
        repairName: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: String, required: true },
        partQuality: {
          id: { type: String },
          name: { type: String },
        },
      },
    ],
    
    // Pricing
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      discountRuleName: { type: String },
      tax: { type: Number, default: 0 },
      taxPercentage: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    
    // Additional
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
BookingSchema.index({ bookingDate: 1, bookingTimeSlot: 1 });
BookingSchema.index({ email: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });

const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
