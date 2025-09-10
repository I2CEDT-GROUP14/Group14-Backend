import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// console.log(process.env.MONGODB_URI)

mongoose.connect(process.env.MONGODB_URI);