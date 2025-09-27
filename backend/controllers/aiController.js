const aiService = require('../services/aiService');

// @desc    Test AI service connection
// @route   GET /api/ai/health
// @access  Private
const testAIConnection = async (req, res) => {
  try {
    const result = await aiService.testConnection();
    
    res.json({
      success: true,
      message: 'AI service status checked',
      data: {
        status: result.status,
        connected: result.success,
        timestamp: new Date().toISOString(),
        ...(result.error && { error: result.error })
      }
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service status',
      error: error.message
    });
  }
};

// @desc    Get AI service configuration
// @route   GET /api/ai/config
// @access  Private
const getAIConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        baseURL: process.env.AI_API_BASE_URL || 'http://localhost:5000/ai',
        timeout: 30000,
        features: {
          cropRecommendations: true,
          soilAnalysis: false, // Disabled as per user request
          weatherIntegration: true,
          fallbackMode: true
        },
        supportedSoilTypes: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky'],
        supportedIrrigationFrequencies: ['daily', 'weekly', 'bi-weekly', 'monthly', 'seasonal']
      }
    });
  } catch (error) {
    console.error('AI config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI configuration',
      error: error.message
    });
  }
};

// @desc    Get sample recommendation for testing
// @route   POST /api/ai/test-recommendation
// @access  Private
const testRecommendation = async (req, res) => {
  try {
    const testData = {
      latitude: 28.6139, // Delhi
      longitude: 77.2090,
      soilType: 'loamy',
      area: 1.0,
      irrigationFrequency: 'weekly',
      pastCrops: []
    };

    const result = await aiService.getCropRecommendations(testData);
    
    res.json({
      success: true,
      message: 'Test recommendation generated',
      data: {
        recommendation: result.data,
        source: result.source,
        success: result.success,
        ...(result.error && { error: result.error })
      }
    });
  } catch (error) {
    console.error('Test recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test recommendation',
      error: error.message
    });
  }
};

module.exports = {
  testAIConnection,
  getAIConfig,
  testRecommendation
};


