const mongoose = require("mongoose")

// Menu Item Schema for listings
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String, enum: ['Starters', 'Main Course', 'Beverages', 'Desserts', 'Snacks'], default: 'Main Course' },
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false }
});

// Operating Hours Schema
const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  open: { type: String, default: "10:00 AM" },
  close: { type: String, default: "10:00 PM" },
  isClosed: { type: Boolean, default: false }
});

// Enhanced Listing Schema
const listingSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  
  // Location
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  address: { type: String },
  
  // Contact Info
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  
  // Business Details
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // ⭐ NEW FIELDS FOR DETAILS PAGE ⭐
  menu: [menuItemSchema],
  operatingHours: [operatingHoursSchema],
  
  // Images
  coverImage: { type: String, default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836" },
  galleryImages: [{ type: String }],
  
  // Features & Amenities
  features: [{ type: String }],  // e.g., ["Parking", "WiFi", "AC", "Outdoor Seating"]
  paymentMethods: [{ type: String }],  // e.g., ["Cash", "UPI", "Card"]
  
  // Ratings
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // Status
  isOpen: { type: Boolean, default: true }
  
}, { timestamps: true })

listingSchema.index({ location: "2dsphere" })

// Method to update rating
listingSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ listing: this._id });
  
  if (reviews.length > 0) {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / reviews.length;
    this.totalReviews = reviews.length;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model("Listing", listingSchema)