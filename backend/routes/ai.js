const express = require('express');
const router = express.Router();
const {
  testAIConnection,
  getAIConfig,
  testRecommendation
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes are protected
router.use(protect);

// @route   GET /api/ai/health
// @desc    Test AI service connection
// @access  Private
router.get('/health', testAIConnection);

// @route   GET /api/ai/config
// @desc    Get AI service configuration
// @access  Private
router.get('/config', getAIConfig);

// @route   POST /api/ai/test-recommendation
// @desc    Generate test recommendation
// @access  Private
router.post('/test-recommendation', testRecommendation);

module.exports = router;
