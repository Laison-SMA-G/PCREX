import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  productId: { type: String, required: false },
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Sale", saleSchema);
