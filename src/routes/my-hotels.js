import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/Hotel.js";
import verifyToken from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
// api/my-hotels

router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const imageFiles = req.files;
      const newHotel = req.body;
      // const {
      //   name,
      //   city,
      //   country,
      //   description,
      //   type,
      //   pricePerNight,
      //   facilities,
      //   starRating,
      //   adultCount,
      //   childCount,
      // } = req.body;

      // if (!imageFiles || imageFiles.length === 0) {
      //   return res.status(400).json({ message: "No images uploaded!" });
      // }
      // 1.upload images to cloudinary
      const uploadPromises = imageFiles?.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64");
        let dataURI = "data:" + image.mimetype + ";base64," + b64;
        // const dataURI = `data:${image.mimetype};base64, ${b64}`;
        const res = await cloudinary.v2.uploader.upload(dataURI);
        return res.url;
      });

      const imageUrls = await Promise?.all(uploadPromises);
      // 2. if uplaod was successful, add the urls to the new hotel
      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;
      // 3. save the new hotel in the database
      // const hotel = new Hotel({
      //   name,
      //   city,
      //   country,
      //   description,
      //   type,
      //   pricePerNight,
      //   facilities,
      //   starRating,
      //   adultCount,
      //   childCount,
      //   imageUrls,
      //   lastUpdated: new Date(),
      //   userId: req.userId,
      // });
      const hotel = new Hotel(newHotel);
      await hotel.save();
      // console.log(req.body.bodyData);
      res.status(201).json(hotel);
    } catch (error) {
      console.log("error creating hotel:", error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
);

router.get("/", verifyToken, async (req, res) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    res.json(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ message: "Error fetching otels" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const id = req.params.id.toString();
  try {
    const hotel = await Hotel.find({
      _id: id,
      userId: req.userId,
    });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error finding Hotel" });
  }
});

export default router;
