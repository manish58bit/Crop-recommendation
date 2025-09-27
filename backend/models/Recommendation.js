const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  soilType: {
    type: String,
    required: true,
    enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky']
  },
  area: {
    type: Number,
    required: true,
    min: [0.1, 'Area must be at least 0.1 acres']
  },
  irrigationFrequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'seasonal']
  },
  pastCrops: [{
    name: String,
    season: String,
    yield: Number,
    benefits: String
  }],
  recommendations: {
    crops: [{
      name: {
        type: String,
        required: true
      },
      variety: String,
      plantingSeason: String,
      expectedYield: String,
      marketPrice: Number,
      confidence: Number,
      description: String,
      benefits: [String]
    }],
    fertilizers: [{
      name: String,
      type: String,
      quantity: String,
      applicationMethod: String,
      timing: String,
      benefits: String
    }],
    irrigation: {
      frequency: String,
      method: String,
      waterRequirement: String,
      timing: String,
      tips: [String]
    },
    weather: {
      current: {
        temperature: Number,
        humidity: Number,
        condition: String,
        windSpeed: Number
      },
      forecast: [{
        date: Date,
        temperature: Number,
        humidity: Number,
        condition: String,
        precipitation: Number
      }]
    }
  },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  imageAnalysis: {
    soilImage: String,
    analysis: String,
    confidence: Number
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for better query performance
recommendationSchema.index({ userId: 1, createdAt: -1 });
recommendationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);

