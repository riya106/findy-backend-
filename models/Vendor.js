const mongoose = require("mongoose");

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  category: { type: String, default: 'Other' },
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false }
}, { timestamps: true });

// Operating Hours Schema
const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  open: { type: String, default: "09:00 AM" },
  close: { type: String, default: "09:00 PM" },
  isClosed: { type: Boolean, default: false }
});

// Gallery Image Schema
const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String },
  isPrimary: { type: Boolean, default: false }
});

// Main Vendor Schema
const vendorSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  shopType: { type: String, required: true },
  description: { type: String },
  address: { type: String },
  
  // Location
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // Live Status
  isLive: { type: Boolean, default: false },
  lastLiveAt: { type: Date },
  
  // Menu & Operations
  menu: [menuItemSchema],
  operatingHours: [operatingHoursSchema],
  
  // Media
  coverImage: { type: String, default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836" },
  logoImage: { type: String },
  galleryImages: [galleryImageSchema],
  
  // Features & Payment
  features: [{ type: String }],
  paymentMethods: [{ type: String }],
  
  // Delivery Options
  offersDelivery: { type: Boolean, default: false },
  offersPickup: { type: Boolean, default: true },
  minimumOrderAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  deliveryRadius: { type: Number, default: 5 },
  
  // Ratings
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // User association
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  
}, { timestamps: true });

// Index for location-based queries
vendorSchema.index({ "location.lat": 1, "location.lng": 1 });
vendorSchema.index({ isLive: 1, "location.lat": 1, "location.lng": 1 });

// Method to update rating - FIXED: use 'vendor' field instead of 'vendorId'
vendorSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  // Fixed: Use 'vendor' field (not 'vendorId')
  const reviews = await Review.find({ vendor: this._id });
  
  if (reviews.length > 0) {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / reviews.length;
    this.totalReviews = reviews.length;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }
  
  await this.save();
  return this;
};

// Static method to update rating by ID
vendorSchema.statics.updateRatingById = async function(vendorId) {
  const vendor = await this.findById(vendorId);
  if (vendor) {
    await vendor.updateRating();
  }
  return vendor;
};

module.exports = mongoose.model("Vendor", vendorSchema);