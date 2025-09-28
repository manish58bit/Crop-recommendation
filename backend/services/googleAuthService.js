const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GoogleAuthService {
  static async verifyGoogleToken(token) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  static async exchangeCodeForToken(code) {
    try {
      const { tokens } = await client.getToken({
        code: code,
        redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`
      });

      // Set credentials for the client
      client.setCredentials(tokens);

      // Get user info from Google
      const response = await client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });

      return {
        googleId: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        emailVerified: response.data.verified_email
      };
    } catch (error) {
      console.error('Google token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
  }

  static async findOrCreateUser(googleUser) {
    try {
      // Check if user exists by email
      let user = await User.findOne({ email: googleUser.email });

      if (user) {
        // Update user with Google ID if not already set
        if (!user.googleId) {
          user.googleId = googleUser.googleId;
          await user.save();
        }
        return user;
      }

      // Create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        isActive: true,
        emailVerified: googleUser.emailVerified,
        profilePicture: googleUser.picture,
        role: 'user'
      });

      await user.save();
      return user;
    } catch (error) {
      throw new Error('Failed to find or create user');
    }
  }

  static generateToken(user) {
    return jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static async authenticateWithGoogle(code) {
    try {
      // Exchange code for user info
      const googleUser = await this.exchangeCodeForToken(code);
      
      // Find or create user
      const user = await this.findOrCreateUser(googleUser);
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture
        },
        token
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = GoogleAuthService;
