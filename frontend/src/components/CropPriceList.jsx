import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, DollarSign, Package } from 'lucide-react';
import { getAllCropPrices, formatPrice } from '../services/priceService';

const CropPriceList = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

  const allPrices = getAllCropPrices();
  
  // Filter and sort crops
  const filteredCrops = allPrices
    .filter(crop => 
      crop.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else {
        aValue = a.pricePerKg;
        bValue = b.pricePerKg;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Current Market Prices</h3>
        </div>
        <div className="text-xs text-gray-500">
          Updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              sortBy === 'name' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('price')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              sortBy === 'price' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Price List */}
      <div className="space-y-3">
        {filteredCrops.map((crop, index) => (
          <motion.div
            key={crop.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{crop.name}</h4>
              <p className="text-xs text-gray-500">
                {crop.market} • {crop.quality}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center text-sm font-semibold text-green-600">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatPrice(crop.pricePerKg)}/kg
                </div>
                <div className="text-xs text-gray-500">
                  {formatPrice(crop.pricePerQuintal)}/quintal
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No crops found matching your search.</p>
        </div>
      )}
    </motion.div>
  );
};

export default CropPriceList;
