import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLogin from '../components/GoogleLogin';
import LocationFetcher from '../components/LocationFetcher';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: {
      latitude: '',
      longitude: '',
      address: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          setFormData({
            ...formData,
            location: {
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address: data.locality || `${latitude}, ${longitude}`,
            },
          });
          
          toast.success('Location detected successfully!');
        } catch (error) {
          console.error('Geocoding error:', error);
          setFormData({
            ...formData,
            location: {
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address: `${latitude}, ${longitude}`,
            },
          });
          toast.success('Location detected!');
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enter manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleGoogleSuccess = async (googleUser) => {
    try {
      setIsLoading(true);
      // The Google user data will be handled by the backend
      // For now, we'll just show success and redirect
      toast.success('Google registration successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google registration error:', error);
      toast.error('Failed to complete Google registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google registration error:', error);
    toast.error('Google registration failed');
  };

  const handleLocationUpdate = (locationData) => {
    setFormData({
      ...formData,
      location: {
        latitude: locationData.latitude?.toString() || '',
        longitude: locationData.longitude?.toString() || '',
        address: locationData.address || '',
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Location validation - make it optional for now
    if (!formData.location.latitude || !formData.location.longitude) {
      // Set default location if not provided
      formData.location = {
        latitude: 28.6139, // Delhi coordinates as default
        longitude: 77.2090,
        address: 'Default Location'
      };
    }

    setIsLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        location: {
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude),
          address: formData.location.address || 'Default Location',
        },
      };

      const result = await register(userData);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <motion.div
            className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600">
            Join us and get AI-powered crop recommendations
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          className="card p-8 space-y-6"
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input pl-10"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input pl-10"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </motion.div>

            {/* Phone Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="input pl-10"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </motion.div>

            {/* Location Section */}
            <motion.div variants={itemVariants}>
              <label className="label">Location</label>
              <div className="space-y-3">
                <LocationFetcher
                  onLocationUpdate={handleLocationUpdate}
                  currentLocation={formData.location}
                  showAddress={true}
                  showCoordinates={true}
                  showCitySearch={true}
                  className="w-full"
                  buttonText="Detect Current Location"
                />
                
                <input
                  name="location.address"
                  type="text"
                  className="input"
                  placeholder="Enter your address"
                  value={formData.location.address}
                  onChange={handleChange}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input pl-10 pr-10"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input pl-10 pr-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-base font-medium relative overflow-hidden group"
              >
                <motion.span
                  className="flex items-center justify-center"
                  initial={false}
                  animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
                >
                  {isLoading ? (
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.span>
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div className="relative mt-6" variants={itemVariants}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </motion.div>

          {/* Google Registration Button */}
          <motion.div variants={itemVariants}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={isLoading}
            />
          </motion.div>
        </motion.div>

        {/* Sign In Link */}
        <motion.div className="text-center" variants={itemVariants}>
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="grid grid-cols-1 gap-4 mt-8"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Free AI crop recommendations</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Personalized farming insights</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Weather and soil analysis</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
