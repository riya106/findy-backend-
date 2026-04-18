const Review = require("../models/reviewModel");
const Listing = require("../models/listingModel");
const Vendor = require("../models/Vendor.js");

// ==================== LISTING REVIEWS ====================

const addReview = async (req, res) => {
  try {
    console.log("=== ADD LISTING REVIEW ===");
    const { rating, comment, listingId } = req.body;
    
    if (!rating || !comment || !listingId) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating, comment, and listingId are required" 
      });
    }
    
    const userId = req.user._id || req.user.id;
    const userName = req.user.name || "Anonymous";
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: "Listing not found" 
      });
    }
    
    const existingReview = await Review.findOne({ user: userId, listing: listingId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already reviewed this listing" 
      });
    }
    
    const review = new Review({
      rating: Number(rating),
      comment: comment,
      user: userId,
      userName: userName,
      listing: listingId
    });
    
    await review.save();
    
    const allReviews = await Review.find({ listing: listingId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    listing.averageRating = totalRating / allReviews.length;
    listing.totalReviews = allReviews.length;
    await listing.save();
    
    const populatedReview = await Review.findById(review._id).populate("user", "name");
    
    res.status(201).json({ 
      success: true, 
      data: populatedReview,
      message: "Review added successfully" 
    });
    
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getListingReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ listing: id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== VENDOR REVIEWS ====================

const addVendorReview = async (req, res) => {
  try {
    console.log("=== ADD VENDOR REVIEW ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user);
    
    const { rating, comment, vendorId } = req.body;
    
    if (!rating || !comment || !vendorId) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating, comment, and vendorId are required" 
      });
    }
    
    const userId = req.user._id || req.user.id;
    const userName = req.user.name || "Anonymous";
    
    console.log("UserId:", userId);
    console.log("VendorId:", vendorId);
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      console.log("Vendor not found!");
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }
    
    console.log("Vendor found:", vendor.name);
    
    if (vendor.userId && vendor.userId.toString() === userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot review your own shop" 
      });
    }
    
    const existingReview = await Review.findOne({ user: userId, vendor: vendorId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already reviewed this vendor" 
      });
    }
    
    const review = new Review({
      rating: Number(rating),
      comment: comment.trim(),
      user: userId,
      userName: userName,
      vendor: vendorId
    });
    
    await review.save();
    console.log("Review saved:", review._id);
    
    await vendor.updateRating();
    
    const populatedReview = await Review.findById(review._id).populate("user", "name");
    
    res.status(201).json({ 
      success: true, 
      data: populatedReview,
      message: "Vendor review submitted successfully" 
    });
    
  } catch (error) {
    console.error("Add vendor review error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to submit vendor review" 
    });
  }
};

const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log("Fetching reviews for vendor:", vendorId);
    
    const reviews = await Review.find({ vendor: vendorId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    
    console.log("Found reviews:", reviews.length);
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get vendor reviews error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  addReview,
  getListingReviews,
  addVendorReview,
  getVendorReviews
};