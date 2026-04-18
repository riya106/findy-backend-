const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["explorer", "seller", "worker"],
    default: "explorer"
  },
  savedLocation: {
    fullAddress: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    area: { type: String, default: "" },
    landmark: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    updatedAt: { type: Date, default: Date.now }
  },
  location: {
    city: { type: String },
    state: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);