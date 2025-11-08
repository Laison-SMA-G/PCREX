import express from "express";
import Sale from "../models/Sale.js";

const router = express.Router();

// Create a sale
router.post("/", async (req, res) => {
  try {
    const { productId, quantity, amount } = req.body;

    if (!productId || !quantity || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sale = new Sale({ productId, quantity, amount, createdAt: new Date() });
    await sale.save();

    res.status(201).json(sale);
  } catch (err) {
    console.error("Error creating sale:", err);
    res.status(500).json({ error: "Failed to create sale" });
  }
});

// Get last 100 sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 }).limit(100);
    res.json(sales);
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ error: err.message });
  }
});

// Sales stats by period
router.get("/stats/:period", async (req, res) => {
  try {
    const { period } = req.params;
    const now = new Date();
    let start;

    if (period === "day") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1));
      start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      return res.status(400).json({ error: 'Invalid period. Use "day", "week", or "month".' });
    }

    const stats = await Sale.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats[0] || { totalAmount: 0, count: 0 });
  } catch (err) {
    console.error("Error fetching sales stats:", err);
    res.status(500).json({ error: err.message, totalAmount: 0, count: 0 });
  }
});

export default router;
