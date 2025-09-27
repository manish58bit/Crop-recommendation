const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  handleValidationErrors
} = require('../utils/validator');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

module.exports = router;

