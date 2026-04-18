const express = require("express");
const router = express.Router();

const checkUserAuth = require("../middleware/authMiddleware");
const { saveEnquiry } = require("../controllers/enquiryController");

/* Create Enquiry (Protected) */
router.post("/add", checkUserAuth, saveEnquiry);

module.exports = router;