import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Droplets, Leaf, TrendingUp, DollarSign, Calendar, Star } from 'lucide-react';
import { recommendAPI, handleApiError } from '../api/api';
import RecommendationCard from '../components/RecommendationCard';
import toast from 'react-hot-toast';

const TestRecommendation = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Sample request data as provided by user
  const sampleData = {
    lat: 23.8,
    lon: 86.8,
    area: 4.5,
    irrigation: 3,
    district: "jamtara",
    soil_type: "alluvial"
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      // Convert sample data to the format expected by our API
      const requestData = {
        location: {
          latitude: sampleData.lat,
          longitude: sampleData.lon,
          address: `${sampleData.district}, India`
        },
        soilType: sampleData.soil_type,
        area: sampleData.area,
        irrigationFrequency: sampleData.irrigation.toString(),
        district: sampleData.district,
        pastCrops: []
      };

      console.log('Sending request:', requestData);
      
      const response = await recommendAPI.getRecommendations(requestData);
      console.log('Response received:', response.data);
      
      setRecommendations(response.data.data.recommendation);
      toast.success('Recommendations generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = handleApiError(error).message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Recommendation API
            </h1>
            <p className="text-gray-600">
              Testing crop recommendations with sample data
            </p>
          </motion.div>

          {/* Sample Data Display */}
          <motion.div className="card p-6 mb-8" variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Request Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-gray-600">{sampleData.lat}, {sampleData.lon}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Leaf className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Soil Type</p>
                  <p className="text-sm text-gray-600 capitalize">{sampleData.soil_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Area</p>
                  <p className="text-sm text-gray-600">{sampleData.area} acres</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Droplets className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Irrigation</p>
                  <p className="text-sm text-gray-600">{sampleData.irrigation} times/season</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">District</p>
                  <p className="text-sm text-gray-600 capitalize">{sampleData.district}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Test Button */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <motion.button
              className="btn-primary flex items-center space-x-2 mx-auto"
              onClick={getRecommendations}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                  <Sparkles className="h-5 w-5" />
                  <span>Get Recommendations</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Results */}
          {recommendations && (
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recommendation Results
              </h2>
              
              {/* Top 3 Crops */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recommendations.recommendations.crops.slice(0, 3).map((crop, index) => (
                  <RecommendationCard
                    key={crop.name}
                    recommendation={crop}
                    index={index}
                    onViewDetails={setSelectedCrop}
                  />
                ))}
              </div>

              {/* All Crops List */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Recommended Crops</h3>
                <div className="space-y-4">
                  {recommendations.recommendations.crops.map((crop, index) => (
                    <div key={crop.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                          <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                          <p className="text-sm text-gray-600">{crop.variety}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Yield</p>
                          <p className="text-sm font-medium">{crop.expectedYield}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-sm font-medium">₹{crop.marketPrice}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Confidence</p>
                          <p className="text-sm font-medium">{Math.round(crop.confidence * 100)}%</p>
                        </div>
                        <button
                          onClick={() => setSelectedCrop(crop)}
                          className="btn-outline text-sm px-3 py-1"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fertilizer Recommendations */}
              {recommendations.recommendations.fertilizers && (
                <div className="card p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fertilizer Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.recommendations.fertilizers.map((fertilizer, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">{fertilizer.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{fertilizer.quantity}</p>
                        <p className="text-xs text-gray-500 mt-2">{fertilizer.benefits}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Irrigation Info */}
              {recommendations.recommendations.irrigation && (
                <div className="card p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Irrigation Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Frequency</p>
                      <p className="text-sm text-gray-600">{recommendations.recommendations.irrigation.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Method</p>
                      <p className="text-sm text-gray-600">{recommendations.recommendations.irrigation.method}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Water Requirement</p>
                      <p className="text-sm text-gray-600">{recommendations.recommendations.irrigation.waterRequirement}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Timing</p>
                      <p className="text-sm text-gray-600">{recommendations.recommendations.irrigation.timing}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Selected Crop Details Modal */}
          {selectedCrop && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCrop.name} Details
                  </h3>
                  <button
                    onClick={() => setSelectedCrop(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedCrop.description}</p>
                  </div>

                  {selectedCrop.benefits && selectedCrop.benefits.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {selectedCrop.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <Star className="h-4 w-4 text-green-500" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Expected Yield</p>
                      <p className="text-sm font-medium">{selectedCrop.expectedYield}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Market Price</p>
                      <p className="text-sm font-medium">₹{selectedCrop.marketPrice}/quintal</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Planting Season</p>
                      <p className="text-sm font-medium">{selectedCrop.plantingSeason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-sm font-medium">{Math.round(selectedCrop.confidence * 100)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestRecommendation;
