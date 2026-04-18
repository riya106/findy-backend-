const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require('dotenv').config();

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, savedLocation } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    
    const user = new User({
      name,
      email,
      phone,
      password,
      role: role || "explorer",
      savedLocation: savedLocation || {
        fullAddress: "",
        pincode: "",
        city: "",
        district: "",
        state: "",
        area: "",
        landmark: "",
        lat: null,
        lng: null
      }
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userID: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedLocation: user.savedLocation
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { userID: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedLocation: user.savedLocation
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Location
const updateUserLocation = async (req, res) => {
  try {
    console.log("📍 Update location request received");
    console.log("📍 User ID:", req.user?.id);
    console.log("📍 Request body:", req.body);
    
    const { fullAddress, pincode, city, district, state, area, landmark, lat, lng } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Update location
    user.savedLocation = {
      fullAddress: fullAddress || user.savedLocation?.fullAddress || "",
      pincode: pincode || user.savedLocation?.pincode || "",
      city: city || user.savedLocation?.city || "",
      district: district || user.savedLocation?.district || "",
      state: state || user.savedLocation?.state || "",
      area: area || user.savedLocation?.area || "",
      landmark: landmark || user.savedLocation?.landmark || "",
      lat: lat || user.savedLocation?.lat || null,
      lng: lng || user.savedLocation?.lng || null,
      updatedAt: new Date()
    };
    
    await user.save();
    
    console.log("✅ Location updated successfully");
    
    res.json({
      success: true,
      message: "Location updated successfully",
      savedLocation: user.savedLocation
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Location
const getUserLocation = async (req, res) => {
  try {
    console.log("📍 Get location request received");
    console.log("📍 User ID:", req.user?.id);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({
      success: true,
      savedLocation: user.savedLocation || {
        fullAddress: "",
        pincode: "",
        city: "",
        district: "",
        state: "",
        area: "",
        landmark: "",
        lat: null,
        lng: null
      }
    });
  } catch (error) {
    console.error("Get location error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUsers,
  updateUserLocation,
  getUserLocation
};