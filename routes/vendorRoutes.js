const express = require("express");
const router = express.Router();
const checkUserAuth = require("../middleware/authMiddleware");
const {
  registerVendor,
  getVendorById,
  getMyVendor,
  getLiveVendors,
  goLive,
  updateVendor,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateOperatingHours,
  updateFeatures,
  updatePaymentMethods,
  addGalleryImage,
  deleteGalleryImage
} = require("../controllers/vendorController");

// IMPORTANT: SPECIFIC ROUTES MUST COME BEFORE DYNAMIC ROUTES

// Public routes
router.get("/live", getLiveVendors);

// Protected routes - SPECIFIC paths FIRST
router.post("/register", checkUserAuth, registerVendor);
router.get("/me", checkUserAuth, getMyVendor);  // ← This MUST be before /:id
router.patch("/go-live", checkUserAuth, goLive);

// Menu management
router.post("/:id/menu", checkUserAuth, addMenuItem);
router.put("/:id/menu/:menuId", checkUserAuth, updateMenuItem);
router.delete("/:id/menu/:menuId", checkUserAuth, deleteMenuItem);

// Operating hours
router.put("/:id/hours", checkUserAuth, updateOperatingHours);

// Features & payment methods
router.patch("/:id/features", checkUserAuth, updateFeatures);
router.patch("/:id/payment-methods", checkUserAuth, updatePaymentMethods);

// Gallery
router.post("/:id/gallery", checkUserAuth, addGalleryImage);
router.delete("/:id/gallery/:imageId", checkUserAuth, deleteGalleryImage);

// Update vendor (specific path with param)
router.put("/:id", checkUserAuth, updateVendor);

// DYNAMIC ROUTE - MUST BE LAST
router.get("/:id", getVendorById);

module.exports = router;