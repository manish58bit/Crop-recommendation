import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, Calculator } from 'lucide-react';
import { getCropPrice, calculateProfit, formatPrice } from '../services/priceService';

const PriceDisplay = ({ cropName, className = '' }) => {
  const [yieldInput, setYieldInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);

  const priceData = getCropPrice(cropName);
  const profitData = yieldInput && costInput ? 
    calculateProfit(cropName, parseFloat(yieldInput), parseFloat(costInput)) : null;

  if (!priceData) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Price information not available for {cropName}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Market Price</h3>
        </div>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <Calculator className="h-4 w-4 mr-1" />
          Calculate Profit
        </button>
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price per Kg</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-600">
            {formatPrice(priceData.pricePerKg)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price per Quintal</span>
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600">
            {formatPrice(priceData.pricePerQuintal)}
          </p>
        </div>
      </div>

      {/* Market Info */}
      <div className="text-xs text-gray-500 mb-4">
        <p>Market: {priceData.market} • Quality: {priceData.quality}</p>
        <p>Last Updated: {new Date(priceData.lastUpdated).toLocaleDateString()}</p>
      </div>

      {/* Profit Calculator */}
      {showCalculator && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t pt-4"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-3">Profit Calculator</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Yield (kg)</label>
              <input
                type="number"
                value={yieldInput}
                onChange={(e) => setYieldInput(e.target.value)}
                placeholder="Enter yield"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Cost per kg</label>
              <input
                type="number"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                placeholder="Enter cost"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {profitData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-3"
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Total Revenue:</span>
                  <p className="font-semibold text-green-600">
                    {formatPrice(profitData.totalRevenue)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total Cost:</span>
                  <p className="font-semibold text-red-600">
                    {formatPrice(profitData.totalCost)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Profit:</span>
                  <p className={`font-semibold ${profitData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(profitData.profit)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Profit Margin:</span>
                  <p className={`font-semibold ${profitData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitData.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PriceDisplay;
