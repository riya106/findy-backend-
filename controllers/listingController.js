const Listing = require("../models/listingModel");

// Get listing by ID with full details
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("sellerId", "name email phone");
    
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create listing with enhanced fields
const createListing = async (req, res) => {
  try {
    const listingData = {
      ...req.body,
      sellerId: req.user.id
    };
    
    const listing = new Listing(listingData);
    await listing.save();
    
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update listing
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json({ success: true, data: updatedListing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add menu item to listing
const addMenuItem = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    listing.menu.push(req.body);
    await listing.save();
    
    res.json({ success: true, data: listing.menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    const menuItem = listing.menu.id(req.params.menuId);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    
    Object.assign(menuItem, req.body);
    await listing.save();
    
    res.json({ success: true, data: listing.menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    listing.menu.id(req.params.menuId).remove();
    await listing.save();
    
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update operating hours
const updateOperatingHours = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    listing.operatingHours = req.body.hours;
    await listing.save();
    
    res.json({ success: true, data: listing.operatingHours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all listings
const getListings = async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get nearby listings
const getNearbyListings = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Latitude and longitude required" });
    }
    
    const listings = await Listing.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      }
    });
    
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  getNearbyListings,
  updateListing,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateOperatingHours
};