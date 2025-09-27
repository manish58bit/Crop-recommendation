const axios = require('axios');

class AIService {
  constructor() {
    this.baseURL = process.env.AI_API_BASE_URL || 'http://localhost:5000/ai';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Get crop recommendations from AI model
   * @param {Object} data - Input data for AI model
   * @returns {Object} AI response with recommendations
   */
  async getCropRecommendations(data) {
    try {
      console.log('Calling AI API for crop recommendations:', {
        latitude: data.latitude,
        longitude: data.longitude,
        soilType: data.soilType,
        area: data.area,
        irrigationFrequency: data.irrigationFrequency
      });

      const response = await axios.post(`${this.baseURL}/recommend`, {
        latitude: data.latitude,
        longitude: data.longitude,
        soilType: data.soilType,
        area: data.area,
        irrigationFrequency: data.irrigationFrequency,
        pastCrops: data.pastCrops || [],
        timestamp: new Date().toISOString()
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CropAI-Backend/1.0'
        }
      });

      return {
        success: true,
        data: response.data,
        source: 'ai_model'
      };

    } catch (error) {
      console.error('AI API Error:', error.message);
      
      // Return fallback recommendations if AI API fails
      return {
        success: false,
        data: this.getFallbackRecommendations(data),
        source: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Get fallback recommendations when AI model is unavailable
   * @param {Object} data - Input data
   * @returns {Object} Fallback recommendations
   */
  getFallbackRecommendations(data) {
    const { latitude, longitude, soilType, area, irrigationFrequency } = data;
    
    // Determine region based on coordinates
    const region = this.getRegionFromCoordinates(latitude, longitude);
    
    // Get soil-specific recommendations
    const soilRecommendations = this.getSoilSpecificRecommendations(soilType);
    
    // Get seasonal recommendations
    const seasonalRecommendations = this.getSeasonalRecommendations();
    
    // Combine and rank recommendations
    const recommendations = this.combineRecommendations(
      soilRecommendations,
      seasonalRecommendations,
      region
    );

    return {
      crops: recommendations.slice(0, 5), // Top 5 recommendations
      fertilizers: this.getFertilizerRecommendations(soilType),
      irrigation: this.getIrrigationRecommendations(irrigationFrequency),
      confidence: 0.75, // Fallback confidence
      source: 'fallback_model',
      region: region,
      soilType: soilType
    };
  }

  /**
   * Determine region from coordinates
   */
  getRegionFromCoordinates(lat, lon) {
    // India regions based on coordinates
    if (lat >= 28 && lat <= 37 && lon >= 70 && lon <= 80) {
      return 'north_india';
    } else if (lat >= 20 && lat <= 28 && lon >= 70 && lon <= 85) {
      return 'central_india';
    } else if (lat >= 8 && lat <= 20 && lon >= 70 && lon <= 85) {
      return 'south_india';
    } else if (lat >= 22 && lat <= 30 && lon >= 85 && lon <= 95) {
      return 'east_india';
    } else if (lat >= 15 && lat <= 25 && lon >= 70 && lon <= 80) {
      return 'west_india';
    }
    return 'general_india';
  }

  /**
   * Get soil-specific crop recommendations
   */
  getSoilSpecificRecommendations(soilType) {
    const soilCrops = {
      clay: [
        {
          name: "Rice",
          variety: "Basmati",
          plantingSeason: "Kharif",
          expectedYield: "4-5 tons/hectare",
          marketPrice: 2500,
          confidence: 0.85,
          description: "Excellent for clay soil with good water retention",
          benefits: ["High yield", "Good market price", "Drought resistant", "Soil improvement"]
        },
        {
          name: "Wheat",
          variety: "HD-2967",
          plantingSeason: "Rabi",
          expectedYield: "3-4 tons/hectare",
          marketPrice: 2000,
          confidence: 0.80,
          description: "Well-suited for clay soil conditions",
          benefits: ["High protein content", "Good storage", "High demand", "Soil structure improvement"]
        }
      ],
      sandy: [
        {
          name: "Groundnut",
          variety: "TMV-2",
          plantingSeason: "Kharif",
          expectedYield: "2-3 tons/hectare",
          marketPrice: 4500,
          confidence: 0.90,
          description: "Perfect for sandy soil with good drainage",
          benefits: ["High oil content", "Good market price", "Drought tolerant", "Soil enrichment"]
        },
        {
          name: "Maize",
          variety: "Hybrid",
          plantingSeason: "Kharif",
          expectedYield: "5-6 tons/hectare",
          marketPrice: 1800,
          confidence: 0.75,
          description: "Suitable for sandy soil with proper irrigation",
          benefits: ["Fast growing", "Multiple uses", "Good yield", "Versatile crop"]
        }
      ],
      loamy: [
        {
          name: "Tomato",
          variety: "Hybrid",
          plantingSeason: "Rabi",
          expectedYield: "20-25 tons/hectare",
          marketPrice: 3000,
          confidence: 0.95,
          description: "Excellent for loamy soil with balanced nutrients",
          benefits: ["High yield", "Good market demand", "Multiple harvests", "High nutrition"]
        },
        {
          name: "Sugarcane",
          variety: "Co-86032",
          plantingSeason: "Kharif",
          expectedYield: "80-100 tons/hectare",
          marketPrice: 2800,
          confidence: 0.85,
          description: "Ideal for loamy soil with good water retention",
          benefits: ["High sugar content", "Good market price", "Long-term crop", "Soil improvement"]
        }
      ],
      silty: [
        {
          name: "Potato",
          variety: "Kufri Jyoti",
          plantingSeason: "Rabi",
          expectedYield: "25-30 tons/hectare",
          marketPrice: 1200,
          confidence: 0.80,
          description: "Well-suited for silty soil conditions",
          benefits: ["High yield", "Good storage", "High demand", "Soil aeration"]
        }
      ],
      peaty: [
        {
          name: "Rice",
          variety: "Swarna",
          plantingSeason: "Kharif",
          expectedYield: "4-5 tons/hectare",
          marketPrice: 2500,
          confidence: 0.85,
          description: "Excellent for peaty soil with high organic matter",
          benefits: ["High yield", "Good market price", "Organic farming", "Soil conservation"]
        }
      ],
      chalky: [
        {
          name: "Barley",
          variety: "RD-2552",
          plantingSeason: "Rabi",
          expectedYield: "2-3 tons/hectare",
          marketPrice: 1500,
          confidence: 0.75,
          description: "Suitable for chalky soil with proper pH management",
          benefits: ["Drought tolerant", "Good for livestock", "Soil improvement", "Low maintenance"]
        }
      ]
    };

    return soilCrops[soilType] || soilCrops.loamy;
  }

  /**
   * Get seasonal recommendations
   */
  getSeasonalRecommendations() {
    const currentMonth = new Date().getMonth() + 1;
    
    if (currentMonth >= 6 && currentMonth <= 10) {
      // Kharif season (June-October)
      return [
        {
          name: "Cotton",
          variety: "BT Cotton",
          plantingSeason: "Kharif",
          expectedYield: "3-4 quintals/hectare",
          marketPrice: 6000,
          confidence: 0.80,
          description: "Perfect for Kharif season",
          benefits: ["High value crop", "Good market price", "Export potential", "Industrial use"]
        },
        {
          name: "Soybean",
          variety: "JS-335",
          plantingSeason: "Kharif",
          expectedYield: "2-3 tons/hectare",
          marketPrice: 3500,
          confidence: 0.75,
          description: "Excellent for Kharif season",
          benefits: ["High protein", "Oil extraction", "Good market demand", "Soil enrichment"]
        }
      ];
    } else {
      // Rabi season (November-April)
      return [
        {
          name: "Mustard",
          variety: "Pusa Bold",
          plantingSeason: "Rabi",
          expectedYield: "1.5-2 tons/hectare",
          marketPrice: 4500,
          confidence: 0.85,
          description: "Ideal for Rabi season",
          benefits: ["Oil production", "Good market price", "Short duration", "Soil improvement"]
        },
        {
          name: "Chickpea",
          variety: "Pusa-372",
          plantingSeason: "Rabi",
          expectedYield: "1.5-2 tons/hectare",
          marketPrice: 4000,
          confidence: 0.80,
          description: "Perfect for Rabi season",
          benefits: ["High protein", "Good market demand", "Nitrogen fixation", "Drought tolerant"]
        }
      ];
    }
  }

  /**
   * Combine and rank recommendations
   */
  combineRecommendations(soilCrops, seasonalCrops, region) {
    const allCrops = [...soilCrops, ...seasonalCrops];
    
    // Remove duplicates and rank by confidence
    const uniqueCrops = allCrops.filter((crop, index, self) => 
      index === self.findIndex(c => c.name === crop.name)
    );
    
    return uniqueCrops.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get fertilizer recommendations
   */
  getFertilizerRecommendations(soilType) {
    const fertilizerMap = {
      clay: [
        {
          name: "NPK 19:19:19",
          type: "Complex",
          quantity: "50 kg/acre",
          applicationMethod: "Broadcasting",
          timing: "Before planting",
          benefits: "Balanced nutrition for clay soil"
        },
        {
          name: "Gypsum",
          type: "Soil Conditioner",
          quantity: "200 kg/acre",
          applicationMethod: "Mixing with soil",
          timing: "Before planting",
          benefits: "Improves soil structure and drainage"
        }
      ],
      sandy: [
        {
          name: "Organic Compost",
          type: "Organic",
          quantity: "2 tons/acre",
          applicationMethod: "Mixing with soil",
          timing: "Before planting",
          benefits: "Improves water retention and nutrient content"
        },
        {
          name: "Urea",
          type: "Nitrogen",
          quantity: "30 kg/acre",
          applicationMethod: "Top dressing",
          timing: "30 days after planting",
          benefits: "Promotes vegetative growth"
        }
      ],
      loamy: [
        {
          name: "NPK 20:20:20",
          type: "Complex",
          quantity: "40 kg/acre",
          applicationMethod: "Broadcasting",
          timing: "Before planting",
          benefits: "Balanced nutrition for loamy soil"
        },
        {
          name: "Vermicompost",
          type: "Organic",
          quantity: "1 ton/acre",
          applicationMethod: "Mixing with soil",
          timing: "Before planting",
          benefits: "Enhances soil fertility and structure"
        }
      ]
    };

    return fertilizerMap[soilType] || fertilizerMap.loamy;
  }

  /**
   * Get irrigation recommendations
   */
  getIrrigationRecommendations(frequency) {
    const irrigationMap = {
      daily: {
        frequency: "Daily",
        method: "Drip irrigation recommended",
        waterRequirement: "2-3 liters per plant per day",
        timing: "Early morning",
        tips: [
          "Monitor soil moisture regularly",
          "Use mulch to retain moisture",
          "Avoid over-irrigation",
          "Check for water stress signs"
        ]
      },
      weekly: {
        frequency: "Weekly",
        method: "Sprinkler or flood irrigation",
        waterRequirement: "15-20 mm per week",
        timing: "Early morning or evening",
        tips: [
          "Deep watering once a week",
          "Use soil moisture sensors",
          "Adjust based on weather",
          "Monitor plant health"
        ]
      },
      'bi-weekly': {
        frequency: "Bi-weekly",
        method: "Flood irrigation",
        waterRequirement: "25-30 mm every two weeks",
        timing: "Early morning",
        tips: [
          "Ensure deep root penetration",
          "Use water conservation techniques",
          "Monitor soil moisture",
          "Adjust for seasonal changes"
        ]
      },
      monthly: {
        frequency: "Monthly",
        method: "Flood irrigation",
        waterRequirement: "50-60 mm per month",
        timing: "Early morning",
        tips: [
          "Deep watering for drought tolerance",
          "Use mulching",
          "Monitor weather patterns",
          "Consider drought-resistant varieties"
        ]
      },
      seasonal: {
        frequency: "Seasonal",
        method: "Rain-fed with supplementary irrigation",
        waterRequirement: "200-300 mm per season",
        timing: "Based on rainfall",
        tips: [
          "Rely on natural rainfall",
          "Supplementary irrigation during dry spells",
          "Use drought-resistant crops",
          "Implement water conservation"
        ]
      }
    };

    return irrigationMap[frequency] || irrigationMap.weekly;
  }

  /**
   * Test AI service connection
   */
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return {
        success: true,
        status: 'connected',
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        status: 'disconnected',
        error: error.message
      };
    }
  }
}

module.exports = new AIService();
