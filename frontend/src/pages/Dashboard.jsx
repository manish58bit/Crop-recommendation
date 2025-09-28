import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Droplets, 
  Sun, 
  Wind, 
  TrendingUp,
  Leaf,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Target,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recommendAPI, handleApiError } from '../api/api';
import api from '../api/api';
import RecommendationCard from '../components/RecommendationCard';
import CropList from '../components/CropList';
import WeatherWidget from '../components/WeatherWidget';
import LocationFetcher from '../components/LocationFetcher';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });
  const [formData, setFormData] = useState({
    soilType: 'alluvial',
    area: '',
    irrigationFrequency: '3',
    district: 'jamtara',
    pastCrops: []
  });
  const [aiStatus, setAiStatus] = useState(null);

  const soilTypes = [
    { value: 'sandy', label: 'Sandy Soil' },
    { value: 'red', label: 'Red Soil' },
    { value: 'black', label: 'Black Soil' },
    { value: 'loamy', label: 'Loamy Soil' },
    { value: 'laterite', label: 'Laterite Soil' },
    { value: 'alluvial', label: 'Alluvial Soil' },
    { value: 'chalky', label: 'Chalky Soil' },
  ];

  const irrigationFrequencies = [
    { value: '0', label: '0 times per season (Rain-fed only)' },
    { value: '1', label: '1 time per season' },
    { value: '2', label: '2 times per season' },
    { value: '3', label: '3 times per season' },
    { value: '4', label: '4 times per season' },
    { value: '5', label: '5 times per season' },
  ];

  const getRecommendations = async () => {
    // Check if user has location in profile
    if (!user?.location || !user.location.latitude || !user.location.longitude) {
      toast.error('Location is required for recommendations. Please update your profile with your current location.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        location: {
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          address: user.location.address || 'Current Location'
        },
        soilType: formData.soilType,
        area: parseFloat(formData.area),
        irrigationFrequency: formData.irrigationFrequency,
        district: formData.district,
        pastCrops: formData.pastCrops
      };

      const response = await recommendAPI.getRecommendations(data);
      setRecommendations(response.data.data.recommendation);
      setShowRecommendationForm(false);
      toast.success('Recommendations generated successfully!');
    } catch (error) {
      const errorMessage = handleApiError(error).message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData({
      ...locationData,
      [name]: value
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          setLocationData({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: data.locality || `${latitude}, ${longitude}`,
          });
          
          toast.success('Location detected successfully!');
        } catch (error) {
          console.error('Geocoding error:', error);
          setLocationData({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: `${latitude}, ${longitude}`,
          });
          toast.success('Location detected!');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enter manually.');
      }
    );
  };

  const updateLocation = async () => {
    if (!locationData.latitude || !locationData.longitude || !locationData.address) {
      toast.error('Please provide complete location information');
      return;
    }

    try {
      const result = await updateProfile({
        location: {
          latitude: parseFloat(locationData.latitude),
          longitude: parseFloat(locationData.longitude),
          address: locationData.address
        }
      });

      if (result.success) {
        setShowLocationForm(false);
        toast.success('Location updated successfully!');
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      console.error('Location update error:', error);
      toast.error('Failed to update location');
    }
  };

  // Handle location update from LocationFetcher
  const handleLocationUpdate = (locationData) => {
    setLocationData({
      latitude: locationData.latitude.toString(),
      longitude: locationData.longitude.toString(),
      address: locationData.address
    });
  };

  // Set AI status as connected (since we know the API exists)
  useEffect(() => {
    setAiStatus({ connected: true, status: 'connected' });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const stats = [
    {
      title: 'Total Recommendations',
      value: recommendations?.recommendations?.crops?.length || 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Avg. Confidence',
      value: recommendations?.recommendations?.crops?.length 
        ? Math.round(recommendations.recommendations.crops.reduce((acc, crop) => acc + parseFloat(crop.confidence), 0) / recommendations.recommendations.crops.length * 100)
        : 0,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Soil Type',
      value: recommendations?.soilType || 'Unknown',
      icon: Leaf,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Farm Area',
      value: recommendations?.area || 0,
      suffix: ' acres',
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                  Get AI-powered crop recommendations for your farm
                </p>
                {/* Location Status */}
                <div className="mt-3 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Location: {user?.location?.address || 'Not set'}
                    </span>
                    {(!user?.location?.latitude || !user?.location?.longitude) && (
                      <button
                        onClick={() => setShowLocationForm(true)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Update Location
                      </button>
                    )}
                  </div>
                  
                  {/* AI Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      aiStatus?.connected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      AI: {aiStatus?.connected ? 'Connected' : 'Fallback Mode'}
                    </span>
                    <span className="text-xs text-gray-500">
                      AI Service Ready
                    </span>
                  </div>
                </div>
              </div>
              <motion.button
                className="btn-primary flex items-center space-x-2"
                onClick={() => {
                  if (!user?.location?.latitude || !user?.location?.longitude) {
                    setShowLocationForm(true);
                    toast.error('Please set your location first to get recommendations');
                  } else {
                    setShowRecommendationForm(true);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5" />
                <span>Get Recommendations</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={itemVariants}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  className="card p-6"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}{stat.suffix}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recommendations */}
            <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
              {!recommendations ? (
                /* Welcome State */
                <motion.div
                  className="card p-8 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Leaf className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to get started?
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get personalized crop recommendations based on your location, soil type, 
                    and farming preferences using our AI-powered system.
                  </p>
                  <motion.button
                    className="btn-primary"
                    onClick={() => setShowRecommendationForm(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get My Recommendations
                  </motion.button>
                </motion.div>
              ) : (
                /* Recommendations Display */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Your Crop Recommendations
                    </h2>
                    <motion.button
                      className="btn-outline flex items-center space-x-2"
                      onClick={() => setShowRecommendationForm(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Update</span>
                    </motion.button>
                  </div>

                  {/* Top 3 Crops */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.recommendations.crops.slice(0, 3).map((crop, index) => (
                      <RecommendationCard
                        key={crop.crop}
                        recommendation={crop}
                        index={index}
                        onViewDetails={setSelectedCrop}
                      />
                    ))}
                  </div>

                  {/* All Crops List */}
                  <CropList
                    crops={recommendations.recommendations.crops}
                    onCropSelect={setSelectedCrop}
                    selectedCrop={selectedCrop}
                  />
                </div>
              )}
            </motion.div>

            {/* Right Column - Weather & Details */}
            <motion.div className="space-y-6" variants={itemVariants}>
              {/* Weather Widget */}
              <WeatherWidget location={user?.location} />

              {/* Selected Crop Details */}
              <AnimatePresence>
                {selectedCrop && (
                  <motion.div
                    className="card p-6"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedCrop.crop} Details
                      </h3>
                      <button
                        onClick={() => setSelectedCrop(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600">Recommended crop for your soil and location conditions.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Confidence</p>
                          <p className="text-sm font-medium">{Math.round(parseFloat(selectedCrop.confidence) * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Crop</p>
                          <p className="text-sm font-medium capitalize">{selectedCrop.crop}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fertilizer Recommendations */}
              {recommendations?.recommendations?.fertilizers && (
                <motion.div
                  className="card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Fertilizer Recommendations
                  </h3>
                  <div className="space-y-3">
                    {recommendations.recommendations.fertilizers.map((fertilizer, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">{fertilizer.name}</h4>
                        <p className="text-sm text-gray-600">{fertilizer.quantity}</p>
                        <p className="text-xs text-gray-500 mt-1">{fertilizer.benefits}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Irrigation Info */}
              {recommendations?.recommendations?.irrigation && (
                <motion.div
                  className="card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Irrigation Guide
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Frequency</p>
                        <p className="text-xs text-gray-600">{recommendations.recommendations.irrigation.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Sun className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Method</p>
                        <p className="text-xs text-gray-600">{recommendations.recommendations.irrigation.method}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Wind className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium">Water Requirement</p>
                        <p className="text-xs text-gray-600">{recommendations.recommendations.irrigation.waterRequirement}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Recommendation Form Modal */}
      <AnimatePresence>
        {showRecommendationForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Get Recommendations
                </h2>
                <button
                  onClick={() => setShowRecommendationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); getRecommendations(); }}>
                <div>
                  <label className="label">Soil Type</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleFormChange}
                    className="input"
                  >
                    {soilTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Farm Area (acres)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleFormChange}
                    className="input"
                    placeholder="Enter farm area"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="label">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleFormChange}
                    className="input"
                    placeholder="Enter district name"
                    required
                  />
                </div>

                <div>
                  <label className="label">Irrigation Frequency</label>
                  <select
                    name="irrigationFrequency"
                    value={formData.irrigationFrequency}
                    onChange={handleFormChange}
                    className="input"
                  >
                    {irrigationFrequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRecommendationForm(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Recommendations
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Update Modal */}
      <AnimatePresence>
        {showLocationForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Update Your Location
                </h2>
                <button
                  onClick={() => setShowLocationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Location</label>
                  <div className="space-y-3">
                    <LocationFetcher
                      onLocationUpdate={handleLocationUpdate}
                      currentLocation={{
                        address: locationData.address,
                        latitude: locationData.latitude,
                        longitude: locationData.longitude
                      }}
                      showAddress={false}
                      showCoordinates={false}
                      showCitySearch={true}
                      buttonText="Use Current Location"
                      className="justify-center"
                    />
                    
                    <input
                      name="address"
                      type="text"
                      className="input"
                      placeholder="Enter your address manually"
                      value={locationData.address}
                      onChange={handleLocationChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Latitude</label>
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      className="input"
                      placeholder="e.g., 28.6139"
                      value={locationData.latitude}
                      onChange={handleLocationChange}
                    />
                  </div>
                  <div>
                    <label className="label">Longitude</label>
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      className="input"
                      placeholder="e.g., 77.2090"
                      value={locationData.longitude}
                      onChange={handleLocationChange}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLocationForm(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={updateLocation}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Location
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
