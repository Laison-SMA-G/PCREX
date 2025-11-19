// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 }, // ✅ fixed stock tracking
    images: [String],
    category: {
      type: String,
      enum: ["Components", "Peripherals", "Accessories", "Pre-built", "Others"],
      default: "Components",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

