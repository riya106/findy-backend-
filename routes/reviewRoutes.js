const express = require("express");
const router = express.Router();
const checkUserAuth = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

// ==================== LISTING REVIEWS ====================
router.post("/add", checkUserAuth, reviewController.addReview);
router.get("/listing/:id", reviewController.getListingReviews);

// ==================== VENDOR REVIEWS (ADD THESE) ====================
router.post("/vendor", checkUserAuth, reviewController.addVendorReview);
router.get("/vendor/:vendorId", reviewController.getVendorReviews);

// Test route to verify routes are working
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Review routes are working!",
    endpoints: {
      addListingReview: "POST /api/review/add",
      getListingReviews: "GET /api/review/listing/:id",
      addVendorReview: "POST /api/review/vendor",
      getVendorReviews: "GET /api/review/vendor/:vendorId"
    }
  });
});

module.exports = router;