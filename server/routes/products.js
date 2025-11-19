import express from "express";
import Product from "../models/Product.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const router = express.Router();

// Multer memory storage (NO FILE SAVED LOCALLY)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Allowed categories
const allowedCategories = ["Components", "Peripherals", "Accessories", "Pre-built", "Others"];

// Helper to upload to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// ----------------------------
// CREATE PRODUCT
// ----------------------------
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    // Upload each image to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer);
      imageUrls.push(url);
    }

    const product = new Product({
      name,
      description,
      price: Number(price) || 0,
      quantity: Number(quantity) || 0,
      images: imageUrls,
      category: allowedCategories.includes(category) ? category : "Others",
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// GET PRODUCTS
// ----------------------------
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const category = req.query.category || "";

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category && category !== "All") query.category = category;

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// EDIT PRODUCT
// ----------------------------
router.put("/edit/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (quantity) product.quantity = Number(quantity);
    if (category && allowedCategories.includes(category))
      product.category = category;

    // Upload new images
    if (req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        product.images.push(url);
      }
    }

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// DELETE PRODUCT
// ----------------------------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// RESTOCK PRODUCT
// ----------------------------
router.put("/restock/:id", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid restock amount" });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: amount } },
      { new: true }
    );

    res.json({ message: "Product restocked", product });
  } catch (err) {
    console.error("❌ Error restocking:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// DECREASE PRODUCT STOCK
// ----------------------------
router.put("/decrease/:id", async (req, res) => {
  try {
    const reduce = Number(req.body.quantity);
    if (!reduce || reduce <= 0)
      return res.status(400).json({ error: "Invalid decrease amount" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.quantity = Math.max(0, product.quantity - reduce);
    await product.save();

    res.json({ message: "Stock decreased", product });
  } catch (err) {
    console.error("❌ Error decreasing stock:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
