const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // use your existing middleware

// Get user profile
router.get('/', protect, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/', protect, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const userId = req.user._id;

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await User.findOne({ 
        phone, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) {
      updateData.location = {
        address: location.address || req.user.location?.address || 'Default Location',
        latitude: location.latitude || req.user.location?.latitude || 28.6139,
        longitude: location.longitude || req.user.location?.longitude || 77.2090
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile update' 
    });
  }
});

module.exports = router;
