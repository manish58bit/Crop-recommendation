import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing Google authentication...');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Google authentication was cancelled or failed.');
          setTimeout(() => {
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: error
            }, window.location.origin);
            window.close();
          }, 2000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from Google.');
          setTimeout(() => {
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'No authorization code'
            }, window.location.origin);
            window.close();
          }, 2000);
          return;
        }

        // Send the authorization code to the backend
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Successfully authenticated with Google!');
          
          // Send success message to parent window
          setTimeout(() => {
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              user: data.user
            }, window.location.origin);
            window.close();
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to authenticate with Google.');
          setTimeout(() => {
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: data.message
            }, window.location.origin);
            window.close();
          }, 2000);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication.');
        setTimeout(() => {
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
          window.close();
        }, 2000);
      }
    };

    handleGoogleCallback();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="h-8 w-8 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Loader className="h-8 w-8 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        
        <h2 className={`text-xl font-semibold mb-2 ${getStatusColor()}`}>
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {status === 'processing' && (
          <div className="text-sm text-gray-500">
            This window will close automatically...
          </div>
        )}
        
        {(status === 'success' || status === 'error') && (
          <div className="text-sm text-gray-500">
            This window will close in a moment...
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleCallback;
