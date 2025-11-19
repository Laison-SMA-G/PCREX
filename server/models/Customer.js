// server/models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String, default: null },
    password: { type: String, required: true }, // optional if you store hashed passwords
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
