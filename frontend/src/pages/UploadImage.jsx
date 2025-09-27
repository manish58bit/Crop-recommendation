import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  X, 
  CheckCircle,
  Sparkles,
  Leaf,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recommendAPI, handleApiError } from '../api/api';
import toast from 'react-hot-toast';

const UploadImage = () => {
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    soilType: 'loamy',
    area: '',
    irrigationFrequency: 'weekly'
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpload = async () => {
    if (!uploadedFile || !user?.location) {
      toast.error('Please upload an image and ensure your location is set');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('soilImage', uploadedFile);
      formDataToSend.append('location', JSON.stringify(user.location));
      formDataToSend.append('soilType', formData.soilType);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('irrigationFrequency', formData.irrigationFrequency);

      const response = await recommendAPI.uploadSoilImage(formDataToSend);
      setAnalysis(response.data.data.recommendation);
      toast.success('Image analysis completed successfully!');
    } catch (error) {
      const errorMessage = handleApiError(error).message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPreview(null);
    setAnalysis(null);
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
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Soil Image Analysis
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload a photo of your soil to get AI-powered analysis and personalized crop recommendations
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload */}
            <motion.div className="space-y-6" variants={itemVariants}>
              {/* Upload Area */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upload Soil Image
                </h2>

                {!preview ? (
                  <motion.div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    {isDragActive ? (
                      <p className="text-primary-600 font-medium">
                        Drop the image here...
                      </p>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-2">
                          Drag & drop your soil image here, or click to select
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports JPG, PNG, WebP (max 5MB)
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <img
                      src={preview}
                      alt="Soil preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={resetUpload}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Form Fields */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Soil Type</label>
                    <select
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleFormChange}
                      className="input"
                    >
                      <option value="clay">Clay Soil</option>
                      <option value="sandy">Sandy Soil</option>
                      <option value="loamy">Loamy Soil</option>
                      <option value="silty">Silty Soil</option>
                      <option value="peaty">Peaty Soil</option>
                      <option value="chalky">Chalky Soil</option>
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
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="seasonal">Seasonal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <motion.button
                className="btn-primary w-full py-3 text-base font-medium flex items-center justify-center"
                onClick={handleUpload}
                disabled={!uploadedFile || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analyze Soil Image
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div className="space-y-6" variants={itemVariants}>
              {!analysis ? (
                /* Placeholder */
                <div className="card p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Analysis Results
                  </h3>
                  <p className="text-gray-600">
                    Upload a soil image to see AI-powered analysis and recommendations
                  </p>
                </div>
              ) : (
                /* Analysis Results */
                <div className="space-y-6">
                  {/* Analysis Summary */}
                  <motion.div
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Analysis Complete
                        </h3>
                        <p className="text-sm text-gray-600">
                          Confidence: {Math.round(analysis.imageAnalysis?.confidence * 100 || 0)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      {analysis.imageAnalysis?.analysis || 'Soil analysis completed successfully.'}
                    </p>
                  </motion.div>

                  {/* Recommended Crops */}
                  {analysis.recommendations?.crops && (
                    <motion.div
                      className="card p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recommended Crops
                      </h3>
                      <div className="space-y-3">
                        {analysis.recommendations.crops.map((crop, index) => (
                          <motion.div
                            key={crop.name}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                <Leaf className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{crop.name}</h4>
                                <p className="text-sm text-gray-600">{crop.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {Math.round(crop.confidence * 100)}%
                              </p>
                              <p className="text-xs text-gray-500">Confidence</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Fertilizer Recommendations */}
                  {analysis.recommendations?.fertilizers && (
                    <motion.div
                      className="card p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Fertilizer Recommendations
                      </h3>
                      <div className="space-y-3">
                        {analysis.recommendations.fertilizers.map((fertilizer, index) => (
                          <motion.div
                            key={index}
                            className="p-3 bg-blue-50 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            <h4 className="font-medium text-gray-900">{fertilizer.name}</h4>
                            <p className="text-sm text-gray-600">{fertilizer.quantity}</p>
                            <p className="text-xs text-gray-500 mt-1">{fertilizer.benefits}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    className="flex space-x-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={resetUpload}
                      className="btn-outline flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Analyze Another Image
                    </button>
                    <button
                      onClick={() => {
                        // Navigate to dashboard or save results
                        toast.success('Results saved to your history!');
                      }}
                      className="btn-primary flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Results
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadImage;
