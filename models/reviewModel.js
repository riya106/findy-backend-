const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    default: "Anonymous"
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing"
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor"
  }
},
{ timestamps: true }
);

// Indexes for faster queries
reviewSchema.index({ vendor: 1, createdAt: -1 });
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ user: 1, vendor: 1 });
reviewSchema.index({ user: 1, listing: 1 });

module.exports = mongoose.model("Review", reviewSchema);