const express = require("express");
const router = express.Router();
const checkUserAuth = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/workerController");

// Public routes
router.get("/all", getWorkers);
router.get("/profession/:profession", getWorkersByProfession);

// Protected routes - SPECIFIC paths MUST come before dynamic /:id
router.post("/register", checkUserAuth, registerWorker);
router.get("/me", checkUserAuth, getMyWorker);  // ← MUST be before /:id
router.put("/:id", checkUserAuth, updateWorker);
router.post("/:id/portfolio", checkUserAuth, addPortfolioItem);
router.post("/:id/review", checkUserAuth, addWorkerReview);
router.put("/:id/availability", checkUserAuth, updateAvailability);
router.patch("/:id/toggle-availability", checkUserAuth, toggleAvailability);

// Dynamic route - MUST BE LAST
router.get("/:id", getWorkerById);

module.exports = router;