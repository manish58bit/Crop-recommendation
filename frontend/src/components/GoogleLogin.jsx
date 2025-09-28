import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chrome } from 'lucide-react';
import { GOOGLE_AUTH_URL } from '../config/googleAuth';
import toast from 'react-hot-toast';

const GoogleLogin = ({ onSuccess, onError, disabled = false, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (disabled || loading) return;

    if (!GOOGLE_AUTH_URL) {
      toast.error('Google OAuth is not configured. Please contact the administrator.');
      return;
    }

    setLoading(true);
    try {
      // Open Google OAuth in a popup window
      const popup = window.open(
        GOOGLE_AUTH_URL,
        'google-login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the popup to close or receive message
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setLoading(false);
        }
      }, 1000);

      // Listen for messages from the popup
      const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          setLoading(false);
          
          if (onSuccess) {
            onSuccess(event.data.user);
          }
          toast.success('Google login successful!');
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageListener);
          setLoading(false);
          
          if (onError) {
            onError(event.data.error);
          }
          toast.error('Google login failed');
        }
      };

      window.addEventListener('message', messageListener);
    } catch (error) {
      setLoading(false);
      console.error('Google login error:', error);
      if (onError) {
        onError(error);
      }
      toast.error('Failed to initiate Google login');
    }
  };

  const isDisabled = disabled || loading || !GOOGLE_AUTH_URL;

  return (
    <motion.button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isDisabled}
      className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span className="text-sm font-medium">Signing in...</span>
        </div>
      ) : (
        <div className="flex items-center">
          <Chrome className="h-5 w-5 mr-3 text-blue-600" />
          <span className="text-sm font-medium">
            {!GOOGLE_AUTH_URL ? 'Google OAuth Not Configured' : 'Continue with Google'}
          </span>
        </div>
      )}
    </motion.button>
  );
};

export default GoogleLogin;
