const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();
const app = express();
app.use(express.json());

// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Helper: effective sales (handles spike window)
function getEffectiveAvgSales(p) {
  const now = new Date();
  if (p.spikeEndDate && now <= p.spikeEndDate && p.spikeMultiplier > 1) {
    return p.avgDailySales * p.spikeMultiplier;
  }
  return p.avgDailySales;
}

// Core calculation for a product
function buildReorderRecommendation(p) {
  const avg = Math.max(getEffectiveAvgSales(p), 0); // avoid negatives
  const daysRemaining = avg > 0 ? p.currentStock / avg : Infinity;

  // Safety stock threshold (lead time + 5 days buffer)
  const safetyStockQty = (p.supplierLeadTime + 5) * avg;

  // Trigger when current stock falls below safety threshold
  const reorderNeeded = p.currentStock < safetyStockQty;

  // Reorder to cover next 60 days, considering current stock + incoming
  let reorderQty = 0;
  if (reorderNeeded) {
    const requiredFor60Days = 60 * avg;
    const netAvailable = p.currentStock + (p.incomingOrders || 0);
    reorderQty = Math.ceil(Math.max(requiredFor60Days - netAvailable, p.minReorderQty));
  }

  const estCost = reorderQty * p.costPerUnit;

  return {
    id: p._id,
    sku: p.sku,
    name: p.name,
    criticality: p.criticality,
    avgDailySalesEffective: avg,
    currentStock: p.currentStock,
    incomingOrders: p.incomingOrders || 0,
    daysRemaining: Number.isFinite(daysRemaining) ? +daysRemaining.toFixed(1) : "∞",
    safetyStockQty: Math.ceil(safetyStockQty),
    reorderNeeded,
    suggestedReorderQty: reorderQty,
    estimatedCost: estCost
  };
}

/* -------- ROUTES -------- */

// sanity route
app.get("/", (_req, res) => res.send("Smart Warehouse API ✅"));

// list products (helps copy IDs)
app.get("/products", async (_req, res) => {
  const items = await Product.find().lean();
  res.json(items);
});

// Reorder Report
app.get("/reorder-report", async (_req, res) => {
  const products = await Product.find();
  const evaluations = products.map(buildReorderRecommendation);
  const toReorder = evaluations.filter((e) => e.reorderNeeded);
  const totalCost = toReorder.reduce((sum, e) => sum + e.estimatedCost, 0);
  res.json({
    generatedAt: new Date(),
    productsNeedingReorder: toReorder,
    estimatedTotalCost: totalCost
  });
});

// Demand spike simulation (GET for simplicity)
// Example: /simulate-spike/<id>?multiplier=3&days=7
app.get("/simulate-spike/:id", async (req, res) => {
  const { id } = req.params;
  const multiplier = Number(req.query.multiplier || 3);
  const days = Number(req.query.days || 7);

  const p = await Product.findById(id);
  if (!p) return res.status(404).send("Product not found");

  const end = new Date();
  end.setDate(end.getDate() + days);

  p.spikeMultiplier = multiplier;
  p.spikeEndDate = end;
  await p.save();

  res.json({
    message: `Spike applied: x${multiplier} for ${days} day(s)`,
    spikeEnds: p.spikeEndDate
  });
});

// Reset spike
app.get("/spike-reset/:id", async (req, res) => {
  const { id } = req.params;
  const p = await Product.findById(id);
  if (!p) return res.status(404).send("Product not found");

  p.spikeMultiplier = 1;
  p.spikeEndDate = null;
  await p.save();

  res.json({ message: "Spike reset" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
