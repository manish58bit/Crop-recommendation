const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getSystemStats,
  getAllRecommendations,
  deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected and require admin role
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private/Admin
router.get('/stats', getSystemStats);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', getUserById);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private/Admin
router.put('/users/:id/status', updateUserStatus);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', deleteUser);

// @route   GET /api/admin/recommendations
// @desc    Get all recommendations
// @access  Private/Admin
router.get('/recommendations', getAllRecommendations);

module.exports = router;

