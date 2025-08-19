import express from "express";
import Product from "../models/productModel.js";

const router = express.Router();

// @desc   Get all products
// @route  GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

export default router;
