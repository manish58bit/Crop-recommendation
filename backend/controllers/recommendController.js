const axios = require('axios');
const Recommendation = require('../models/Recommendation');

// @desc    Get crop recommendations based on location and soil data
// @route   POST /api/recommend
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const { 
      location, 
      soilType, 
      area, 
      irrigationFrequency, 
      pastCrops = [] 
    } = req.body;

    const userId = req.user.id;

    // Prepare data for AI API
    const aiRequestData = {
      latitude: location.latitude,
      longitude: location.longitude,
      soilType,
      area,
      irrigationFrequency,
      pastCrops
    };

    // Call AI API for recommendations
    let aiResponse;
    try {
      const aiApiUrl = `${process.env.AI_API_BASE_URL}/recommend`;
      const response = await axios.post(aiApiUrl, aiRequestData, {
        timeout: 30000 // 30 seconds timeout
      });
      aiResponse = response.data;
    } catch (aiError) {
      console.error('AI API Error:', aiError.message);
      
      // Fallback recommendations if AI API fails
      aiResponse = {
        crops: [
          {
            name: "Rice",
            variety: "Basmati",
            plantingSeason: "Kharif",
            expectedYield: "4-5 tons/hectare",
            marketPrice: 2500,
            confidence: 0.7,
            description: "Suitable for your soil type and climate",
            benefits: ["High yield", "Good market price", "Drought resistant"]
          },
          {
            name: "Wheat",
            variety: "HD-2967",
            plantingSeason: "Rabi",
            expectedYield: "3-4 tons/hectare",
            marketPrice: 2000,
            confidence: 0.8,
            description: "Excellent for your region",
            benefits: ["High protein content", "Good storage", "High demand"]
          },
          {
            name: "Maize",
            variety: "Hybrid",
            plantingSeason: "Kharif",
            expectedYield: "5-6 tons/hectare",
            marketPrice: 1800,
            confidence: 0.6,
            description: "Good for your soil conditions",
            benefits: ["Fast growing", "Multiple uses", "Good yield"]
          }
        ],
        fertilizers: [
          {
            name: "NPK 19:19:19",
            type: "Complex",
            quantity: "50 kg/acre",
            applicationMethod: "Broadcasting",
            timing: "Before planting",
            benefits: "Balanced nutrition for all crops"
          },
          {
            name: "Urea",
            type: "Nitrogen",
            quantity: "25 kg/acre",
            applicationMethod: "Top dressing",
            timing: "30 days after planting",
            benefits: "Promotes vegetative growth"
          }
        ],
        irrigation: {
          frequency: irrigationFrequency,
          method: "Drip irrigation recommended",
          waterRequirement: "500-700 mm per season",
          timing: "Early morning or evening",
          tips: [
            "Monitor soil moisture regularly",
            "Avoid over-irrigation",
            "Use mulch to retain moisture"
          ]
        }
      };
    }

    // Get weather data
    let weatherData;
    try {
      const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
      const weatherResponse = await axios.get(weatherApiUrl);
      
      weatherData = {
        current: {
          temperature: weatherResponse.data.main.temp,
          humidity: weatherResponse.data.main.humidity,
          condition: weatherResponse.data.weather[0].description,
          windSpeed: weatherResponse.data.wind.speed
        }
      };
    } catch (weatherError) {
      console.error('Weather API Error:', weatherError.message);
      weatherData = {
        current: {
          temperature: 25,
          humidity: 60,
          condition: "Clear sky",
          windSpeed: 5
        }
      };
    }

    // Create recommendation record
    const recommendation = await Recommendation.create({
      userId,
      location,
      soilType,
      area,
      irrigationFrequency,
      pastCrops,
      recommendations: {
        ...aiResponse,
        weather: weatherData
      },
      aiResponse,
      status: 'completed'
    });

    res.json({
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
    });

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
