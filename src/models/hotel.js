import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  adultCount: { type: String, required: true },
  childCount: { type: String, required: true },
  facilities: [{ type: String, required: true }],
  pricePerNight: { type: String, required: true },
  starRating: { type: Number, required: true, min: 1, max: 5 },
  imageUrls: [{ type: String, required: true }],
  lastUpdated: { type: String, required: true },
});

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
