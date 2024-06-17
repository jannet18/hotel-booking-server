import express from "express";
import Hotel from "../models/Hotel.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = pageNumber - 1 * pageSize;

    const hotels = await Hotel.find().skip(skip).limit(pageSize);

    const total = await Hotel.countDocuments();

    const response = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

export default router;
