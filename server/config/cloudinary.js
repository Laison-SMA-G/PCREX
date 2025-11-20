// server/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: "dggvqyg57",
  api_key: "279792582865717",
  api_secret: "d_KxO9vmqGvSxRveajAc8EWoxRA"
});

export default cloudinary;
