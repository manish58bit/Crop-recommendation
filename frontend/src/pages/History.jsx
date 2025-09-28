import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Calendar, 
  MapPin, 
  Leaf, 
  Download, 
  Trash2, 
  Eye, 
  Filter,
  Search,
  ChevronDown,
  TrendingUp,
  FileText,
  X
} from 'lucide-react';
import { historyAPI, handleApiError } from '../api/api';
import toast from 'react-hot-toast';

const History = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await historyAPI.getHistory({
        page,
        limit: pagination.itemsPerPage
      });
      
      setRecommendations(response.data.data.recommendations);
      setPagination(response.data.data.pagination);
    } catch (error) {
      const errorMessage = handleApiError(error).message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.itemsPerPage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) {
      return;
    }

    try {
      await historyAPI.deleteHistoryItem(id);
      setRecommendations(recommendations.filter(rec => rec._id !== id));
      toast.success('Recommendation deleted successfully');
    } catch (error) {
      const errorMessage = handleApiError(error).message;
      toast.error(errorMessage);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await historyAPI.exportHistory(format);
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recommendation_history.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recommendation_history.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success('History exported successfully');
    } catch (error) {
      const errorMessage = handleApiError(error).message;
      toast.error(errorMessage);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.soilType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.recommendations?.crops?.some(crop => 
                           crop.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'recent' && new Date(rec.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (filterBy === 'high-confidence' && rec.recommendations?.crops?.some(crop => crop.confidence >= 0.8));
    
    return matchesSearch && matchesFilter;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'area':
        return b.area - a.area;
      default:
        return 0;
    }
  });

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

  const HistoryCard = ({ recommendation, index }) => {
    const topCrop = recommendation.recommendations?.crops?.[0];
    const avgConfidence = recommendation.recommendations?.crops?.length 
      ? Math.round(recommendation.recommendations.crops.reduce((acc, crop) => acc + crop.confidence, 0) / recommendation.recommendations.crops.length * 100)
      : 0;

    return (
      <motion.div
        className="card p-6 hover:shadow-medium transition-all duration-200 cursor-pointer"
        variants={itemVariants}
        whileHover={{ y: -2 }}
        onClick={() => setSelectedRecommendation(recommendation)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <HistoryIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {topCrop?.name || 'Crop Recommendation'}
              </h3>
              <p className="text-sm text-gray-600">
                {recommendation.location?.address || 'Location not specified'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{avgConfidence}%</p>
            <p className="text-xs text-gray-500">Avg. Confidence</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium">
                {new Date(recommendation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Area</p>
              <p className="text-sm font-medium">{recommendation.area} acres</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Leaf className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Soil Type</p>
              <p className="text-sm font-medium capitalize">{recommendation.soilType}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Crops</p>
              <p className="text-sm font-medium">
                {recommendation.recommendations?.crops?.length || 0} recommended
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {recommendation.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecommendation(recommendation);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(recommendation._id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Recommendation History
                </h1>
                <p className="text-gray-600">
                  View and manage your past crop recommendations
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleExport('json')}
                  className="btn-outline flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              {/* <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recommendations..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div> */}

              {/* Sort */}
              <div className="relative">
                <select
                  className="input pr-10 appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="area">Largest Area</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center space-x-2 ${
                  showFilters ? 'bg-primary-50 text-primary-600' : ''
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="flex flex-wrap gap-2 mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {[
                    { value: 'all', label: 'All Recommendations' },
                    { value: 'recent', label: 'Last 7 Days' },
                    { value: 'high-confidence', label: 'High Confidence' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFilterBy(option.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filterBy === option.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : sortedRecommendations.length === 0 ? (
              <div className="text-center py-12">
                <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
                <p className="text-gray-600">Start by getting your first crop recommendation</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRecommendations.map((recommendation, index) => (
                  <HistoryCard
                    key={recommendation._id}
                    recommendation={recommendation}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              className="flex items-center justify-center space-x-2 mt-8"
              variants={itemVariants}
            >
              <button
                onClick={() => fetchHistory(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchHistory(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Recommendation Detail Modal */}
      <AnimatePresence>
        {selectedRecommendation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recommendation Details
                </h2>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedRecommendation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedRecommendation.location?.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium">{selectedRecommendation.area} acres</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soil Type:</span>
                        <span className="font-medium capitalize">{selectedRecommendation.soilType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Irrigation:</span>
                        <span className="font-medium capitalize">{selectedRecommendation.irrigationFrequency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Crops */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Crops</h3>
                  <div className="space-y-3">
                    {selectedRecommendation.recommendations?.crops?.map((crop, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{crop.name}</h4>
                          <span className="text-sm text-gray-600">
                            {Math.round(crop.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{crop.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Yield: {crop.expectedYield}</span>
                          <span>Price: ₹{crop.marketPrice}/q</span>
                          <span>Season: {crop.plantingSeason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
