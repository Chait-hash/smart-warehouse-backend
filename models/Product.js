const mongoose = require("mongoose");

// This matches the assignment fields
const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true }, // Unique ID
    name: { type: String, required: true },

    // Inventory + sales
    currentStock: { type: Number, required: true, default: 0 },
    avgDailySales: { type: Number, required: true, default: 0 }, // last 30 days avg

    // Supplier + cost
    supplierLeadTime: { type: Number, required: true, default: 0 }, // days
    minReorderQty: { type: Number, required: true, default: 0 },
    costPerUnit: { type: Number, required: true, default: 0 },
    criticality: { type: String, enum: ["high", "medium", "low"], default: "low" },

    // Optional: consider incoming POs
    incomingOrders: { type: Number, default: 0 },

    // Demand spike simulation
    spikeMultiplier: { type: Number, default: 1 },
    spikeEndDate: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
