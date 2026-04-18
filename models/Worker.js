const mongoose = require("mongoose");

// Portfolio Item Schema
const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  completedDate: { type: Date }
}, { timestamps: true });

// Review Schema for Workers
const workerReviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String },
  jobTitle: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Availability Schema
const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  isAvailable: { type: Boolean, default: true },
  startTime: { type: String, default: "09:00 AM" },
  endTime: { type: String, default: "06:00 PM" }
});

// Enhanced Worker Schema
const workerSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  profession: { type: String, required: true },
  experience: { type: Number, default: 0 },
  description: { type: String },
  
  // Location
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  address: { type: String },
  serviceArea: [{ type: String }],
  
  // Professional Details
  hourlyRate: { type: Number, default: 0 },
  languages: [{ type: String }],
  certifications: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  
  // Availability
  availability: [availabilitySchema],
  isAvailable: { type: Boolean, default: true },
  
  // Portfolio
  portfolio: [portfolioItemSchema],
  
  // Ratings & Reviews
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  reviews: [workerReviewSchema],
  
  // Stats
  totalJobsCompleted: { type: Number, default: 0 },
  hireCount: { type: Number, default: 0 },
  
  // Images
  profileImage: { type: String, default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
  coverImage: { type: String, default: "https://images.unsplash.com/photo-1521737711867-e3b97375f902" },
  
  // User association
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  
}, { timestamps: true });

// Index for location-based queries
workerSchema.index({ "location.lat": 1, "location.lng": 1 });

// Method to update rating
workerSchema.methods.updateRating = async function() {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = total / this.reviews.length;
    this.totalReviews = this.reviews.length;
    await this.save();
  }
};

module.exports = mongoose.model("Worker", workerSchema);