const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getRecommendations,
  uploadSoilImage,
  getRecommendationById
} = require('../controllers/recommendController');
const { protect } = require('../middleware/auth');
const {
  recommendationValidation,
  handleValidationErrors
} = require('../utils/validator');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'soil-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/recommend
// @desc    Get crop recommendations based on location and soil data
// @access  Private
router.post('/', protect, recommendationValidation, handleValidationErrors, getRecommendations);

// @route   POST /api/recommend/upload-image
// @desc    Upload soil image for analysis
// @access  Private
router.post('/upload-image', protect, upload.single('soilImage'), uploadSoilImage);

// @route   GET /api/recommend/:id
// @desc    Get recommendation by ID
// @access  Private
router.get('/:id', protect, getRecommendationById);

module.exports = router;

