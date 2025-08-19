const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected for seeding"))
  .catch((err) => console.error("❌ Connection error:", err));

const seedProducts = async () => {
  try {
    await Product.deleteMany();

    const products = [
      {
        sku: "LAP-001",
        name: "Laptop 14\"",
        currentStock: 50,
        avgDailySales: 2,
        supplierLeadTime: 7,
        minReorderQty: 20,
        costPerUnit: 50000,
        criticality: "high",
        incomingOrders: 0
      },
      {
        sku: "MOU-010",
        name: "Wireless Mouse",
        currentStock: 200,
        avgDailySales: 10,
        supplierLeadTime: 5,
        minReorderQty: 50,
        costPerUnit: 500,
        criticality: "medium",
        incomingOrders: 30
      },
      {
        sku: "KEY-020",
        name: "Mechanical Keyboard",
        currentStock: 150,
        avgDailySales: 5,
        supplierLeadTime: 6,
        minReorderQty: 30,
        costPerUnit: 1500,
        criticality: "medium",
        incomingOrders: 0
      },
      {
        sku: "CAB-005",
        name: "USB-C Cable",
        currentStock: 600,
        avgDailySales: 25,
        supplierLeadTime: 4,
        minReorderQty: 100,
        costPerUnit: 150,
        criticality: "high",
        incomingOrders: 50
      },
      {
        sku: "BAG-030",
        name: "Laptop Sleeve",
        currentStock: 80,
        avgDailySales: 3,
        supplierLeadTime: 10,
        minReorderQty: 25,
        costPerUnit: 700,
        criticality: "low",
        incomingOrders: 0
      }
    ];

    await Product.insertMany(products);
    console.log("✅ Assignment-style sample products added!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedProducts();
