const Worker = require("../models/Worker");
const User = require("../models/userModel");

// Register worker
const registerWorker = async (req, res) => {
  try {
    const { name, phone, profession, experience, lat, lng, address, email, description, hourlyRate } = req.body;
    
    const existingWorker = await Worker.findOne({ userId: req.user.id });
    if (existingWorker) {
      return res.status(400).json({ success: false, message: 'Worker profile already exists' });
    }
    
    await User.findByIdAndUpdate(req.user.id, { role: 'worker' });
    
    const worker = new Worker({
      userId: req.user.id,
      name,
      phone,
      email: email || req.user.email,
      profession,
      experience: parseInt(experience) || 0,
      experienceYears: parseInt(experience) || 0,
      location: { lat: lat || 0, lng: lng || 0 },
      address: address || "",
      description: description || "",
      hourlyRate: hourlyRate || 0,
      isAvailable: true,
      availability: [
        { day: "Monday", isAvailable: true, startTime: "09:00 AM", endTime: "06:00 PM" },
        { day: "Tuesday", isAvailable: true, startTime: "09:00 AM", endTime: "06:00 PM" },
        { day: "Wednesday", isAvailable: true, startTime: "09:00 AM", endTime: "06:00 PM" },
        { day: "Thursday", isAvailable: true, startTime: "09:00 AM", endTime: "06:00 PM" },
        { day: "Friday", isAvailable: true, startTime: "09:00 AM", endTime: "06:00 PM" },
        { day: "Saturday", isAvailable: true, startTime: "10:00 AM", endTime: "04:00 PM" },
        { day: "Sunday", isAvailable: false, startTime: "10:00 AM", endTime: "04:00 PM" }
      ]
    });
    
    await worker.save();
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    console.error("Register worker error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get logged-in worker's profile (for dashboard)
const getMyWorker = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error("Get my worker error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get worker by ID (for public profile)
const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate("userId", "name email");
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error("Get worker by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all workers
const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
      .select("-reviews -portfolio")
      .sort({ rating: -1, createdAt: -1 });
    
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error("Get workers error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get workers by profession
const getWorkersByProfession = async (req, res) => {
  try {
    const { profession } = req.params;
    const workers = await Worker.find({ 
      profession: { $regex: new RegExp(profession, "i") } 
    }).sort({ rating: -1 });
    
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error("Get workers by profession error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update worker profile
const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    
    if (worker.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json({ success: true, data: updatedWorker });
  } catch (error) {
    console.error("Update worker error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add portfolio item
const addPortfolioItem = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    
    if (worker.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    worker.portfolio.push(req.body);
    await worker.save();
    
    res.json({ success: true, data: worker.portfolio });
  } catch (error) {
    console.error("Add portfolio error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add worker review
const addWorkerReview = async (req, res) => {
  try {
    const { rating, comment, jobTitle } = req.body;
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    
    const existingReview = worker.reviews.find(r => r.user.toString() === req.user.id);
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this worker" });
    }
    
    worker.reviews.push({
      rating,
      comment,
      user: req.user.id,
      userName: req.user.name,
      jobTitle: jobTitle || ""
    });
    
    const total = worker.reviews.reduce((sum, r) => sum + r.rating, 0);
    worker.rating = total / worker.reviews.length;
    worker.totalReviews = worker.reviews.length;
    
    await worker.save();
    
    res.status(201).json({ success: true, data: worker.reviews });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update availability
const updateAvailability = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    
    if (worker.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    worker.availability = req.body.availability;
    await worker.save();
    
    res.json({ success: true, data: worker.availability });
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle availability status
const toggleAvailability = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    
    if (worker.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    worker.isAvailable = !worker.isAvailable;
    await worker.save();
    
    res.json({ success: true, data: { isAvailable: worker.isAvailable } });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerWorker,
  getWorkers,
  getWorkerById,
  getWorkersByProfession,
  updateWorker,
  addPortfolioItem,
  addWorkerReview,
  updateAvailability,
  toggleAvailability,
  getMyWorker
};