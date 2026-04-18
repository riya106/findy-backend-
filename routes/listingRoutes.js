const express = require("express");
const router = express.Router();
const checkUserAuth = require("../middleware/authMiddleware");
const listingController = require("../controllers/listingController");

router.post("/add", checkUserAuth, listingController.createListing);
router.get("/all", listingController.getListings);
router.get("/nearby", listingController.getNearbyListings);
router.get("/:id", listingController.getListingById);

module.exports = router;