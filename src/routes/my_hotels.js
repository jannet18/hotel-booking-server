import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
// api/my-hotels

router.post("/", upload.array("imageFiles", 6), async (req, res) => {
  try {
    const imageFiles = req.files[""];
    const newHotel = req.body;
    // 1.upload images to cloudinary
    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;
      const res = await cloudinary.v2.uploader.upload(dataURI);
      return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    //2. if uplaod was successful, add the urls to the new hotel
    newHotel.imageUrls = imageUrls;
    newHotel.lastUpdated = new Date();
    newHotel.userId = req.userId;
    //3. save the new hotel in the database
    const hotel = new Hotel(newHotel);
    await hotel.save();
  } catch (error) {
    console.log("error creating hotel:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});
