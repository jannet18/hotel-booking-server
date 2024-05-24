import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/Users.js";
import authRoutes from "./routes/auth.js";

await mongoose.connect(process.env.MONGODB_CONNECTION);

const app = express();
app.use(express.json()); //converts body of API into json automatically
app.use(express.urlencoded({ extended: true })); // parse the url and get url parameters
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server is active");
});
