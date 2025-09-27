import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Star, 
  Leaf, 
  Droplets,
  Sun,
  Wind,
  Thermometer,
  Eye
} from 'lucide-react';

const RecommendationCard = ({ recommendation, index, onViewDetails }) => {
  const {
    name,
    variety,
    plantingSeason,
    expectedYield,
    marketPrice,
    confidence,
    description,
    benefits = []
  } = recommendation;

  const confidenceColor = confidence >= 0.8 ? 'text-green-600' : 
                         confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  const confidenceBg = confidence >= 0.8 ? 'bg-green-100' : 
                      confidence >= 0.6 ? 'bg-yellow-100' : 'bg-red-100';

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut'
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1 + 0.2,
        ease: 'backOut'
      }
    }
  };

  return (
    <motion.div
      className="card-hover p-6 relative overflow-hidden group"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Confidence Badge */}
      <motion.div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${confidenceBg} ${confidenceColor}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {Math.round(confidence * 100)}% Match
      </motion.div>

      {/* Crop Icon */}
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4 relative z-10"
        variants={iconVariants}
      >
        <Leaf className="h-8 w-8 text-white" />
      </motion.div>

      {/* Crop Name */}
      <motion.h3
        className="text-xl font-bold text-gray-900 mb-2 relative z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.4 }}
      >
        {name}
      </motion.h3>

      {/* Variety */}
      {variety && (
        <motion.p
          className="text-sm text-gray-600 mb-3 relative z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.5 }}
        >
          Variety: <span className="font-medium">{variety}</span>
        </motion.p>
      )}

      {/* Description */}
      <motion.p
        className="text-gray-700 mb-4 line-clamp-2 relative z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.6 }}
      >
        {description}
      </motion.p>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.7 }}
      >
        {/* Expected Yield */}
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Yield</p>
            <p className="text-sm font-medium text-gray-900">{expectedYield}</p>
          </div>
        </div>

        {/* Market Price */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-medium text-gray-900">₹{marketPrice}/quintal</p>
          </div>
        </div>

        {/* Planting Season */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Season</p>
            <p className="text-sm font-medium text-gray-900">{plantingSeason}</p>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-600" />
          <div>
            <p className="text-xs text-gray-500">Confidence</p>
            <p className="text-sm font-medium text-gray-900">{Math.round(confidence * 100)}%</p>
          </div>
        </div>
      </motion.div>

      {/* Benefits */}
      {benefits.length > 0 && (
        <motion.div
          className="mb-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.8 }}
        >
          <p className="text-xs font-medium text-gray-500 mb-2">Key Benefits:</p>
          <div className="flex flex-wrap gap-1">
            {benefits.slice(0, 3).map((benefit, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {benefit}
              </span>
            ))}
            {benefits.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{benefits.length - 3} more
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        className="w-full btn-primary py-2 text-sm relative z-10"
        onClick={() => onViewDetails && onViewDetails(recommendation)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </motion.button>

      {/* Hover Effect Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
      />
    </motion.div>
  );
};

// Weather Widget Component
export const WeatherWidget = ({ weather }) => {
  if (!weather) return null;

  const { current } = weather;

  return (
    <motion.div
      className="card p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Current Weather</h3>
        <Sun className="h-6 w-6 text-yellow-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-xs text-gray-500">Temperature</p>
            <p className="text-sm font-medium">{current.temperature}°C</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Humidity</p>
            <p className="text-sm font-medium">{current.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Wind className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Wind</p>
            <p className="text-sm font-medium">{current.windSpeed} km/h</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-xs text-gray-500">Condition</p>
            <p className="text-sm font-medium capitalize">{current.condition}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;


