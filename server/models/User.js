import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String, default: "/uploads/default.png" },
});

export default mongoose.model("User", userSchema);
