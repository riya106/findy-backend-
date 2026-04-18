const Vendor = require("../models/Vendor");
const User = require("../models/userModel");

// Register vendor
const registerVendor = async (req, res) => {
  try {
    const { name, phone, shopType, description, address, lat, lng, email } = req.body;
    
    const existingVendor = await Vendor.findOne({ userId: req.user.id });
    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'Vendor profile already exists' });
    }
    
    await User.findByIdAndUpdate(req.user.id, { role: 'seller' });
    
    const vendor = new Vendor({
      userId: req.user.id,
      name,
      phone,
      email: email || req.user.email,
      shopType,
      description: description || "",
      address: address || "",
      location: { lat: lat || 0, lng: lng || 0 },
      paymentMethods: ["Cash", "UPI"],
      features: [],
      menu: [],
      operatingHours: [
        { day: "Monday", open: "09:00 AM", close: "09:00 PM", isClosed: false },
        { day: "Tuesday", open: "09:00 AM", close: "09:00 PM", isClosed: false },
        { day: "Wednesday", open: "09:00 AM", close: "09:00 PM", isClosed: false },
        { day: "Thursday", open: "09:00 AM", close: "09:00 PM", isClosed: false },
        { day: "Friday", open: "09:00 AM", close: "09:00 PM", isClosed: false },
        { day: "Saturday", open: "10:00 AM", close: "10:00 PM", isClosed: false },
        { day: "Sunday", open: "10:00 AM", close: "08:00 PM", isClosed: false }
      ]
    });
    
    await vendor.save();
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    console.error("Register vendor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get logged-in vendor's profile
const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor profile not found" });
    }
    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error("Get my vendor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("userId", "name email");
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error("Get vendor by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get live vendors
const getLiveVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isLive: true })
      .select("-menu -operatingHours -galleryImages")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: vendors });
  } catch (error) {
    console.error("Get live vendors error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Go live / Stop live
const goLive = async (req, res) => {
  try {
    const { vendorId, lat, lng } = req.body;
    
    const vendor = await Vendor.findOne({ _id: vendorId, userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    vendor.isLive = !vendor.isLive;
    if (vendor.isLive && lat && lng) {
      vendor.location = { lat, lng };
      vendor.lastLiveAt = new Date();
    }
    
    await vendor.save();
    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error("Go live error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json({ success: true, data: updatedVendor });
  } catch (error) {
    console.error("Update vendor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add menu item
const addMenuItem = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    vendor.menu.push(req.body);
    await vendor.save();
    
    res.json({ success: true, data: vendor.menu });
  } catch (error) {
    console.error("Add menu item error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    const menuItem = vendor.menu.id(req.params.menuId);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    
    Object.assign(menuItem, req.body);
    await vendor.save();
    
    res.json({ success: true, data: vendor.menu });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id, menuId } = req.params;
    
    console.log("1. Received request to delete");
    console.log("2. Vendor ID:", id);
    console.log("3. Menu ID:", menuId);
    
    // Find vendor
    const vendor = await Vendor.findById(id);
    console.log("4. Vendor found:", vendor ? vendor.name : "NO");
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    console.log("5. User ID from token:", req.user.id);
    console.log("6. Vendor userId:", vendor.userId.toString());
    console.log("7. Authorization match:", vendor.userId.toString() === req.user.id);
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    console.log("8. Current menu items:", vendor.menu.map(i => ({ id: i._id.toString(), name: i.name })));
    
    // Find and remove
    const beforeCount = vendor.menu.length;
    vendor.menu = vendor.menu.filter(item => item._id.toString() !== menuId);
    const afterCount = vendor.menu.length;
    
    console.log("9. Before count:", beforeCount);
    console.log("10. After count:", afterCount);
    
    if (beforeCount === afterCount) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    
    await vendor.save();
    console.log("11. Save successful");
    
    res.json({ 
      success: true, 
      message: "Menu item deleted successfully",
      data: vendor.menu 
    });
    
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update operating hours
const updateOperatingHours = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    vendor.operatingHours = req.body.hours;
    await vendor.save();
    
    res.json({ success: true, data: vendor.operatingHours });
  } catch (error) {
    console.error("Update hours error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update features
const updateFeatures = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    vendor.features = req.body.features;
    await vendor.save();
    
    res.json({ success: true, data: vendor.features });
  } catch (error) {
    console.error("Update features error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update payment methods
const updatePaymentMethods = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    vendor.paymentMethods = req.body.paymentMethods;
    await vendor.save();
    
    res.json({ success: true, data: vendor.paymentMethods });
  } catch (error) {
    console.error("Update payment methods error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add gallery image
const addGalleryImage = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    vendor.galleryImages.push(req.body);
    await vendor.save();
    
    res.json({ success: true, data: vendor.galleryImages });
  } catch (error) {
    console.error("Add gallery image error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete gallery image
const deleteGalleryImage = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    if (vendor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    vendor.galleryImages.id(req.params.imageId).remove();
    await vendor.save();
    
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete gallery image error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};