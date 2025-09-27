import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Leaf,
  ChevronDown
} from 'lucide-react';

const CropList = ({ crops = [], onCropSelect, selectedCrop }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('confidence');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort crops
  const filteredAndSortedCrops = crops
    .filter(crop => {
      const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           crop.variety?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'high-confidence' && crop.confidence >= 0.8) ||
                           (filterBy === 'high-yield' && crop.expectedYield?.includes('5-6')) ||
                           (filterBy === 'kharif' && crop.plantingSeason === 'Kharif') ||
                           (filterBy === 'rabi' && crop.plantingSeason === 'Rabi');
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'yield':
          return parseFloat(b.expectedYield?.split('-')[0] || 0) - parseFloat(a.expectedYield?.split('-')[0] || 0);
        case 'price':
          return b.marketPrice - a.marketPrice;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const sortOptions = [
    { value: 'confidence', label: 'Confidence', icon: Star },
    { value: 'yield', label: 'Expected Yield', icon: TrendingUp },
    { value: 'price', label: 'Market Price', icon: DollarSign },
    { value: 'name', label: 'Name', icon: Leaf },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Crops' },
    { value: 'high-confidence', label: 'High Confidence (80%+)' },
    { value: 'high-yield', label: 'High Yield' },
    { value: 'kharif', label: 'Kharif Season' },
    { value: 'rabi', label: 'Rabi Season' },
  ];

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
      transition: { duration: 0.3 }
    }
  };

  const CropCard = ({ crop, index }) => {
    const confidenceColor = crop.confidence >= 0.8 ? 'text-green-600 bg-green-100' : 
                           crop.confidence >= 0.6 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';

    return (
      <motion.div
        className={`card p-4 cursor-pointer transition-all duration-200 ${
          selectedCrop?.name === crop.name 
            ? 'ring-2 ring-primary-500 bg-primary-50' 
            : 'hover:shadow-medium hover:-translate-y-1'
        }`}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onCropSelect && onCropSelect(crop)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{crop.name}</h3>
              {crop.variety && (
                <p className="text-sm text-gray-600">{crop.variety}</p>
              )}
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidenceColor}`}>
            {Math.round(crop.confidence * 100)}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Yield</p>
              <p className="text-sm font-medium">{crop.expectedYield}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-sm font-medium">₹{crop.marketPrice}/q</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">{crop.plantingSeason}</span>
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(crop.confidence * 5) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const CropListItem = ({ crop, index }) => {
    const confidenceColor = crop.confidence >= 0.8 ? 'text-green-600 bg-green-100' : 
                           crop.confidence >= 0.6 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';

    return (
      <motion.div
        className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${
          selectedCrop?.name === crop.name 
            ? 'bg-primary-50 border-2 border-primary-500' 
            : 'hover:bg-gray-50 border border-gray-200'
        }`}
        variants={itemVariants}
        whileHover={{ x: 4 }}
        onClick={() => onCropSelect && onCropSelect(crop)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{crop.name}</h3>
            {crop.variety && (
              <p className="text-sm text-gray-600">{crop.variety}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">Yield</p>
            <p className="text-sm font-medium">{crop.expectedYield}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-medium">₹{crop.marketPrice}/q</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Season</p>
            <p className="text-sm font-medium">{crop.plantingSeason}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceColor}`}>
            {Math.round(crop.confidence * 100)}%
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0" variants={itemVariants}>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended Crops</h2>
          <p className="text-gray-600">
            {filteredAndSortedCrops.length} crops found
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div className="space-y-4" variants={itemVariants}>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              className="input pr-10 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {filterOptions.map(option => (
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

      {/* Crop List */}
      <motion.div variants={itemVariants}>
        {filteredAndSortedCrops.length === 0 ? (
          <div className="text-center py-12">
            <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-3'
          }>
            {filteredAndSortedCrops.map((crop, index) => (
              viewMode === 'grid' ? (
                <CropCard key={crop.name} crop={crop} index={index} />
              ) : (
                <CropListItem key={crop.name} crop={crop} index={index} />
              )
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CropList;
