import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/Users.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import path from "path";

await mongoose.connect(process.env.MONGODB_CONNECTION);

const app = express();
app.use(cookieParser());
app.use(express.json()); //converts body of API into json automatically
app.use(express.urlencoded({ extended: true })); // parse the url and get url parameters
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "../../client/src")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(5000, () => {
  console.log("Server is active");
});
