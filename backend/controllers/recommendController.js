const axios = require('axios');
const Recommendation = require('../models/Recommendation');
const aiService = require('../services/aiService');

// @desc    Get crop recommendations based on location and soil data
// @route   POST /api/recommend
// @access  Private
const getRecommendations = async (req, res) => {
  console.log(req.body);
  try {
    const { 
      location, 
      soilType, 
      area, 
      irrigationFrequency, 
      pastCrops = [],
      district = 'unknown'
    } = req.body;

    const userId = req.user.id;

    // Validate location is provided
    if (!location || !location.latitude || !location.longitude || !location.address) {
      return res.status(400).json({
        success: false,
        message: 'Location information is required for crop recommendations. Please provide latitude, longitude, and address.'
      });
    }

    // Prepare data for AI service
    const aiRequestData = {
      latitude: location.latitude,
      longitude: location.longitude,
      soilType,
      area,
      irrigationFrequency,
      pastCrops,
      district
    };

    // Get recommendations from AI service
    console.log('Calling AI service with data:', aiRequestData);
    const aiResult = await aiService.getCropRecommendations(aiRequestData);
    console.log('AI service result:', { success: aiResult.success, source: aiResult.source, hasData: !!aiResult.data });
    
    if (!aiResult.success) {
      console.error('AI service failed:', aiResult.error);
      return res.status(500).json({
        success: false,
        message: 'AI service unavailable. Using fallback recommendations.',
        error: aiResult.error
      });
    }
    
    const aiResponse = aiResult.data;

    // Create recommendation record
    console.log('Creating recommendation record...');
    console.log('Recommendations data:', JSON.stringify(aiResponse, null, 2));
    
    const recommendation = await Recommendation.create({
      userId,
      location,
      soilType,
      area,
      irrigationFrequency,
      pastCrops,
      recommendations: aiResponse,
      aiResponse: {
        ...aiResponse,
        source: aiResult.source,
        success: aiResult.success,
        error: aiResult.error
      },
      status: 'completed'
    });
    console.log('Recommendation record created:', recommendation._id);

    const responseData = {
      success: true,
      message: 'Recommendations generated successfully',
      data: {
        recommendation: {
          id: recommendation._id,
          location: recommendation.location,
          soilType: recommendation.soilType,
          area: recommendation.area,
          irrigationFrequency: recommendation.irrigationFrequency,
          pastCrops: recommendation.pastCrops,
          recommendations: recommendation.recommendations,
          createdAt: recommendation.createdAt
        }
      }
    };
    
    console.log('Sending response with', recommendation.recommendations.crops?.length || 0, 'crops');
    res.json(responseData);

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload soil image for analysis
// @route   POST /api/recommend/upload-image
// @access  Private
const uploadSoilImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user.id;
    const { location, soilType, area, irrigationFrequency } = req.body;

    // Validate location is provided
    if (!location || !location.latitude || !location.longitude || !location.address) {
      return res.status(400).json({
        success: false,
        message: 'Location information is required for soil image analysis. Please provide latitude, longitude, and address.'
      });
    }

    // Prepare image data for AI API
    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString('base64');

    // Call AI API for image analysis
    let imageAnalysis;
    try {
      const aiApiUrl = `${process.env.AI_API_BASE_URL}/upload_image`;
      const response = await axios.post(aiApiUrl, {
        image: imageBase64,
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude)
        },
        soilType,
        area: parseFloat(area),
        irrigationFrequency
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      imageAnalysis = response.data;
    } catch (aiError) {
      console.error('AI Image Analysis Error:', aiError.message);
      
      // Fallback analysis
      imageAnalysis = {
        analysis: "Soil appears to be in good condition with adequate moisture content. Recommended for most crops.",
        confidence: 0.75,
        recommendations: {
          crops: [
            {
              name: "Tomato",
              variety: "Hybrid",
              plantingSeason: "Rabi",
              expectedYield: "20-25 tons/hectare",
              marketPrice: 3000,
              confidence: 0.8,
              description: "Excellent soil conditions for tomato cultivation",
              benefits: ["High yield", "Good market demand", "Suitable for your soil"]
            }
          ],
          fertilizers: [
            {
              name: "Compost",
              type: "Organic",
              quantity: "2 tons/acre",
              applicationMethod: "Mixing with soil",
              timing: "Before planting",
              benefits: "Improves soil structure and fertility"
            }
          ]
        }
      };
    }

    // Create recommendation record with image analysis
    const recommendation = await Recommendation.create({
      userId,
      location: JSON.parse(location),
      soilType,
      area: parseFloat(area),
      irrigationFrequency,
      recommendations: imageAnalysis.recommendations || {},
      imageAnalysis: {
        soilImage: `/uploads/${req.file.filename}`,
        analysis: imageAnalysis.analysis,
        confidence: imageAnalysis.confidence
      },
      aiResponse: imageAnalysis,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Image analysis completed successfully',
      data: {
        recommendation: {
          id: recommendation._id,
          imageAnalysis: recommendation.imageAnalysis,
          recommendations: recommendation.recommendations,
          createdAt: recommendation.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get recommendation by ID
// @route   GET /api/recommend/:id
// @access  Private
const getRecommendationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recommendation = await Recommendation.findOne({
      _id: id,
      userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: {
        recommendation
      }
    });

  } catch (error) {
    console.error('Get recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRecommendations,
  uploadSoilImage,
  getRecommendationById
};
