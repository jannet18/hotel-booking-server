import express from "express";
import Hotel from "../models/Hotel.js";

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
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

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

// router.get("/search", async (req, res) => {
//   try {
//     const {
//       destination,
//       checkIn,
//       checkOut,
//       adultCount,
//       childCount,
//       page = 1,
//       limit = 5,
//       sort = "name",
//       order = "asc",
//       minPrice,
//       maxPrice,
//       facilities = [],
//     } = req.query;

//     const parsedPage = parseInt(page, 10);
//     const parsedLimit = parseInt(limit, 10);
//     const skip = (parsedPage - 1) * parsedLimit;

//     const sortOptions = {};
//     sortOptions[sort] = order === "asc" ? 1 : -1;

//     const query = {
//       destination: new RegExp(destination, "i"),
//       checkIn: { $gte: new Date(checkIn) },
//       checkOut: { $lte: new Date(checkOut) },
//       adultCount: { $gte: parseInt(adultCount, 10) },
//       childCount: { $gte: parseInt(childCount, 10) },
//       pricePerNight: {
//         ...(minPrice && { $gte: parseFloat(minPrice) }),
//         ...(maxPrice && { $gte: parseFloat(maxPrice) }),
//       },
//       facilities: { $all: facilities },
//     };

//     const hotels = await Hotel.find(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parsedLimit);

//     const totalResults = await Hotel.countDocuments(query);

//     res
//       .status(200)
//       .json({ hotels, totalResults, page: parsedPage, limit: parsedLimit });
//   } catch (error) {
//     res.status(500).json({ message: "Erro fetching hotels", error });
//   }
// });
const constructSearchQuery = (queryParams) => {
  let constructedQuery = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
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

  return constructedQuery;
};
export default router;
