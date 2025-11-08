// routes/products.js
import express from "express";
import Product from "../models/Product.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Allowed categories
const allowedCategories = ["Components", "Peripherals", "Accessories", "Pre-built", "Others"];

// ✅ CREATE PRODUCT
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const product = new Product({
      name,
      description,
      price: isNaN(Number(price)) ? 0 : Number(price),
      quantity: isNaN(Number(quantity)) ? 0 : Number(quantity),
      images,
      category: allowedCategories.includes(category) ? category : "Others",
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET PRODUCTS (with base64 images)
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const category = req.query.category || "";

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category && category !== "All") query.category = category;

    const products = await Product.find(query).sort({ createdAt: -1 });

    const withBase64 = products.map((p) => {
      const imgs = (p.images || []).map((img) => {
        const full = path.join(process.cwd(), img);
        if (fs.existsSync(full)) {
          const base64 = fs.readFileSync(full, "base64");
          const ext = path.extname(img).substring(1) || "png";
          return `data:image/${ext};base64,${base64}`;
        }
        return null;
      });
      return { ...p.toObject(), images: imgs.filter(Boolean) };
    });

    res.json(withBase64);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ EDIT PRODUCT
router.put("/edit/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Update fields safely
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = isNaN(Number(price)) ? product.price : Number(price);
    if (quantity !== undefined) product.quantity = isNaN(Number(quantity)) ? product.quantity : Number(quantity);

    if (category !== undefined && allowedCategories.includes(category)) {
      product.category = category;
    }

    // Append new images
    if (req.files && req.files.length > 0) {
      req.files.forEach((f) => product.images.push(`/uploads/${f.filename}`));
    }

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ RESTOCK PRODUCT
router.put("/restock/:id", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount <= 0)
      return res.status(400).json({ error: "Invalid restock amount" });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: amount } },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    console.log(`✅ Restocked ${product.name} by ${amount}. New qty: ${product.quantity}`);
    res.json({ message: "Product restocked successfully", product });
  } catch (err) {
    console.error("❌ Error restocking product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DECREASE PRODUCT QUANTITY
router.put("/decrease/:id", async (req, res) => {
  try {
    const dec = Number(req.body.quantity);
    if (isNaN(dec) || dec <= 0)
      return res.status(400).json({ error: "Invalid decrease amount" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.quantity = Math.max(0, product.quantity - dec);
    await product.save();

    res.json({ message: "Product stock decreased successfully", product });
  } catch (err) {
    console.error("❌ Error decreasing stock:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
