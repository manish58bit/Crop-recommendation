const express = require('express');
const router = express.Router();
const {
  getHistory,
  getHistoryById,
  deleteHistoryItem,
  getUserStats,
  exportHistory
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

// @route   GET /api/history
// @desc    Get user's recommendation history
// @access  Private
router.get('/', protect, getHistory);

// @route   GET /api/history/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, getUserStats);

// @route   GET /api/history/export
// @desc    Export user's recommendation history
// @access  Private
router.get('/export', protect, exportHistory);

// @route   GET /api/history/:id
// @desc    Get detailed recommendation by ID
// @access  Private
router.get('/:id', protect, getHistoryById);

// @route   DELETE /api/history/:id
// @desc    Delete recommendation from history
// @access  Private
router.delete('/:id', protect, deleteHistoryItem);

module.exports = router;

