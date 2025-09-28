// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Check if Google Client ID is configured
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id.apps.googleusercontent.com') {
  console.warn('Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file');
}

// Google OAuth Scopes
export const GOOGLE_SCOPES = [
  'openid',
  'profile',
  'email'
].join(' ');

// Google OAuth Configuration Object
export const GOOGLE_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  scope: GOOGLE_SCOPES,
  redirectUri: `${window.location.origin}/auth/google/callback`,
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};

// Google OAuth URLs
export const GOOGLE_AUTH_URL = GOOGLE_CLIENT_ID ? `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.redirectUri)}&` +
  `response_type=${GOOGLE_CONFIG.responseType}&` +
  `scope=${encodeURIComponent(GOOGLE_SCOPES)}&` +
  `access_type=${GOOGLE_CONFIG.accessType}&` +
  `prompt=${GOOGLE_CONFIG.prompt}&` +
  `include_granted_scopes=true` : null;

export default GOOGLE_CONFIG;
