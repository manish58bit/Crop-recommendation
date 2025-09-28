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
  RefreshCw,
  MapPin,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UploadImage = () => {
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSaveImage = () => {
    if (uploadedFile && preview) {
      const newImage = {
        id: Date.now(),
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        preview: preview,
        uploadedAt: new Date().toISOString()
      };
      
      setUploadedImages(prev => [newImage, ...prev]);
      setUploadedFile(null);
      setPreview(null);
      toast.success('Image saved successfully!');
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    toast.success('Image removed successfully!');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });


  const resetUpload = () => {
    setUploadedFile(null);
    setPreview(null);
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
              <p className="text-gray-600 max-w-2xl mx-auto mb-4">
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
                      className="input"
                      defaultValue="loamy"
                    >
                      <option value="sandy">Sandy Soil</option>
                      <option value="red">Red Soil</option>
                      <option value="black">Black Soil</option>
                      <option value="loamy">Loamy Soil</option>
                      <option value="laterite">Laterite Soil</option>
                      <option value="alluvial">Alluvial Soil</option>
                      <option value="chalky">Chalky Soil</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Farm Area (acres)</label>
                    <input
                      type="number"
                      name="area"
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
                      className="input"
                      defaultValue="2"
                    >
                      <option value="0">0 times per season (Rain-fed only)</option>
                      <option value="1">1 time per season</option>
                      <option value="2">2 times per season</option>
                      <option value="3">3 times per season</option>
                      <option value="4">4 times per season</option>
                      <option value="5">5 times per season</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                className="btn-primary w-full py-3 text-base font-medium flex items-center justify-center"
                onClick={handleSaveImage}
                disabled={!uploadedFile}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Save Image
              </motion.button>
            </motion.div>

            {/* Right Column - Saved Images */}
            <motion.div className="space-y-6" variants={itemVariants}>
              {uploadedImages.length === 0 ? (
                /* Placeholder */
                <div className="card p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Images Saved Yet
                  </h3>
                  <p className="text-gray-600">
                    Upload and save images to build your collection
                  </p>
                </div>
              ) : (
                /* Saved Images */
                <motion.div
                  className="card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Saved Images ({uploadedImages.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {uploadedImages.map((image) => (
                      <motion.div
                        key={image.id}
                        className="border border-gray-200 rounded-lg p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 truncate">{image.name}</h4>
                            <p className="text-sm text-gray-500">
                              {(image.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(image.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadImage;
