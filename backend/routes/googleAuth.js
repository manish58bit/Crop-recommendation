const express = require('express');
const router = express.Router();
const GoogleAuthService = require('../services/googleAuthService');

// POST /api/auth/google - Handle Google OAuth callback
router.post('/', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const result = await GoogleAuthService.authenticateWithGoogle(code);

    if (result.success) {
      res.json({
        success: true,
        user: result.user,
        token: result.token,
        message: 'Google authentication successful'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
