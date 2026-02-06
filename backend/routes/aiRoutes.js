// AI Routes for Smart City Tracker
// Place this file at: backend/routes/aiRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  improveDescription,
  checkDuplicates,
  analyzePriority,
  suggestTitle,
} = require("../controllers/aiController");

// All AI routes require authentication
router.use(protect);

// POST /api/ai/improve-description
router.post("/improve-description", improveDescription);

// POST /api/ai/check-duplicates
router.post("/check-duplicates", checkDuplicates);

// POST /api/ai/analyze-priority
router.post("/analyze-priority", analyzePriority);

// POST /api/ai/suggest-title
router.post("/suggest-title", suggestTitle);

module.exports = router;
