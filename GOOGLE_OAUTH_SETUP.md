# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your crop prediction application.

## Prerequisites

1. A Google Cloud Platform account
2. Access to Google Cloud Console
3. Your application running locally or deployed

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: "Crop Prediction System"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Add test users (for development) or publish the app (for production)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
   - **Important**: Make sure the redirect URI matches exactly (no trailing slashes)
5. Copy the Client ID (you'll need this)

## Step 4: Configure Environment Variables

### Backend (.env)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Step 5: Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend server:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to the login page
4. Click "Continue with Google"
5. Complete the OAuth flow

## Features Implemented

### Frontend
- ✅ Google Login button component
- ✅ OAuth callback page
- ✅ Integration with existing login page
- ✅ Popup-based OAuth flow
- ✅ Error handling and user feedback

### Backend
- ✅ Google OAuth service
- ✅ User model updates for Google OAuth
- ✅ JWT token generation
- ✅ User creation/update on first login
- ✅ API endpoint for OAuth callback

### Database
- ✅ Updated User schema with Google OAuth fields
- ✅ Optional phone/password for Google users
- ✅ Profile picture support
- ✅ Email verification status

## Security Considerations

1. **Client ID Security**: The Google Client ID is safe to expose in frontend code
2. **Token Validation**: All Google tokens are validated server-side
3. **User Data**: Only necessary user data is stored
4. **JWT Tokens**: Secure JWT tokens are generated for authenticated users

## Troubleshooting

### Common Issues

1. **"400 Bad Request" Error**
   - **Most Common Cause**: Redirect URI mismatch
   - Check that redirect URI in Google Console exactly matches: `http://localhost:3000/auth/google/callback`
   - Ensure no trailing slashes or extra characters
   - Verify the Client ID is correct in environment variables
   - Check that the OAuth consent screen is properly configured

2. **"Invalid redirect URI"**
   - Ensure the redirect URI in Google Console matches exactly
   - Check for trailing slashes and protocol (http vs https)
   - Make sure the URI is added to the correct OAuth client

3. **"Access blocked"**
   - Check OAuth consent screen configuration
   - Ensure test users are added (for development)
   - Verify app is published (for production)

4. **"Invalid client ID"**
   - Double-check the Client ID in environment variables
   - Ensure no extra spaces or characters
   - Verify the Client ID is from the correct Google Cloud project

5. **CORS Issues**
   - Ensure backend CORS is configured for frontend URL
   - Check that API endpoints are accessible

### Debug Steps

1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Check backend logs for authentication errors
4. Verify environment variables are loaded correctly

## Production Deployment

1. Update redirect URIs in Google Console for production domain
2. Update environment variables for production
3. Ensure HTTPS is enabled (required for OAuth)
4. Test the complete flow in production environment

## API Endpoints

- `POST /api/auth/google` - Handle Google OAuth callback
- `GET /auth/google/callback` - Frontend OAuth callback page

## User Flow

1. User clicks "Continue with Google"
2. Popup opens with Google OAuth consent screen
3. User grants permissions
4. Google redirects to callback page with authorization code
5. Backend exchanges code for user information
6. User is created/updated in database
7. JWT token is generated and returned
8. User is logged in and redirected to dashboard

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure Google Cloud Console configuration matches your setup
4. Check browser and server logs for specific error messages
