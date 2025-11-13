import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// ✅ Create new order (for users)
router.post("/", async (req, res) => {
  try {
    const newOrder = await Order.create(req.body);
    const populatedOrder = await newOrder.populate("customerId", "name email");

    // 🔔 Notify admins (Socket.IO)
    if (req.io) req.io.emit("newOrder", populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Get all orders (or filter by customerId)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;

    const orders = await Order.find(filter)
      .populate("customerId", "name email")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Update order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("customerId", "name email");

    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
