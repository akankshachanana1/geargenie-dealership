import mongoose from "mongoose";

const serviceEstimateSchema = new mongoose.Schema(
  {
    vehicleID: { type: String, required: true },
    totalEstimatedCostUSD: { type: Number, required: true },
    // Add other fields as needed
  },
  { timestamps: true }
);

export default mongoose.model("ServiceEstimate", serviceEstimateSchema, "serviceestimates");