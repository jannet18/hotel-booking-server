import express from "express";
import Hotel from "../models/Hotel.js";
import { param, validationResult } from "express-validator";
const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};

    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }
    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = parseInt(pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

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

// Search hotels with filters and sorting
// router.get("/search", async (req, res) => {
//   const {
//     destination,
//     checkIn,
//     checkOut,
//     adultCount,
//     childCount,
//     page = 1,
//     stars,
//     types,
//     facilities,
//     maxPrice,
//     sortOption,
//   } = req.query;

//   try {
//     const query = {
//       ...(destination && { location: { $regex: destination, $options: "i" } }),
//       ...(stars && { starRating: { $in: stars.split(",").map(Number) } }),
//       ...(types && { hotelType: { $in: types.split(",") } }),
//       ...(facilities && { facilityTypes: { $all: facilities.split(",") } }),
//       ...(maxPrice && { pricePerNight: { $lte: Number(maxPrice) } }),
//     };

//     const sort = {};
//     if (sortOption === "pricePerNightAsc") {
//       sort.pricePerNight = 1;
//     } else if (sortOption === "pricePerNightDesc") {
//       sort.pricePerNight = -1;
//     } else if (sortOption === "starRating") {
//       sort.starRating = -1;
//     }

//     const hotels = await Hotel.find(query)
//       .skip((page - 1) * 10)
//       .limit(10)
//       .sort(sort);

//     const total = await Hotel.countDocuments(query);

//     res.json({
//       hotels,
//       pagination: { total, page, pages: Math.ceil(total / 10) },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error searching hotels", error });
//   }
// });

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id.toString();
    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Error fetching hotel!" });
    }
  }
);
const constructSearchQuery = (queryParams) => {
  let constructedQuery = {};

  if (
    queryParams?.destination &&
    typeof queryParams.destination === "string" &&
    queryParams.destination.trim() !== ""
  ) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams?.destination, "i") },
      { country: new RegExp(queryParams?.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }
  console.log("constructed query:", constructedQuery);
  return constructedQuery;
};
export default router;
