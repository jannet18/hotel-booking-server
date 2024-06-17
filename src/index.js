import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/Users.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import myHotelRoutes from "./routes/my-hotels.js";
import hotelRoutes from "./routes/hotel.js";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
await mongoose.connect(process.env.MONGODB_CONNECTION);

const __dirname = path.resolve();
const app = express();
app.use(cookieParser());
app.use(express.json()); //converts body of API into json automatically
app.use(express.urlencoded({ extended: true })); // parse the url and get url parameters
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
// app.use(express.static(path.join(__dirname, "../../client/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
// });
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("api/hotels", hotelRoutes);

app.listen(5000, () => {
  console.log("Server is active");
});
