const express = require("express");
const router = express.Router();
const checkUserAuth = require("../middleware/authMiddleware");
const { 
  registerUser, 
  loginUser, 
  getUsers,
  updateUserLocation,
  getUserLocation
} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.get("/all", checkUserAuth, getUsers);
router.put("/location", checkUserAuth, updateUserLocation);
router.get("/location", checkUserAuth, getUserLocation);

module.exports = router;