// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["GCASH", "COD", "CARD"], required: true },
  shippingAddress: { type: String },
  status: {
    type: String,
    enum: ["To Pay", "To Ship", "To Receive", "Completed", "Cancelled"],
    default: "To Pay",
  },
  orderDate: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
