import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Leaf, 
  Eye
} from 'lucide-react';

const RecommendationCard = ({ recommendation, index, onViewDetails }) => {
  const {
    crop,
    confidence
  } = recommendation;

  const confidenceValue = parseFloat(confidence);
  const confidenceColor = confidenceValue >= 0.8 ? 'text-green-600' : 
                         confidenceValue >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  const confidenceBg = confidenceValue >= 0.8 ? 'bg-green-100' : 
                      confidenceValue >= 0.6 ? 'bg-yellow-100' : 'bg-red-100';

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
        {Math.round(confidenceValue * 100)}% Match
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
        className="text-xl font-bold text-gray-900 mb-2 relative z-10 capitalize"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.4 }}
      >
        {crop}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-gray-700 mb-4 line-clamp-2 relative z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.6 }}
      >
        Recommended crop for your soil and location conditions.
      </motion.p>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 mb-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.7 }}
      >
        {/* Confidence Score */}
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-600" />
          <div>
            <p className="text-xs text-gray-500">Confidence</p>
            <p className="text-sm font-medium text-gray-900">{Math.round(confidenceValue * 100)}%</p>
          </div>
        </div>
      </motion.div>

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

export default RecommendationCard;