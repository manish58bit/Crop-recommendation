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
      red: [
        {
          name: "Rice",
          variety: "Basmati",
          plantingSeason: "Kharif",
          expectedYield: "4-5 tons/hectare",
          marketPrice: 2500,
          confidence: 0.85,
          description: "Excellent for red soil with good water retention",
          benefits: ["High yield", "Good market price", "Drought resistant", "Soil improvement"]
        },
        {
          name: "Cotton",
          variety: "BT Cotton",
          plantingSeason: "Kharif",
          expectedYield: "3-4 tons/hectare",
          marketPrice: 6000,
          confidence: 0.80,
          description: "Well-suited for red soil conditions",
          benefits: ["High value crop", "Good market demand", "Fiber quality", "Economic benefits"]
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
      black: [
        {
          name: "Sugarcane",
          variety: "Co-86032",
          plantingSeason: "Kharif",
          expectedYield: "80-100 tons/hectare",
          marketPrice: 3000,
          confidence: 0.90,
          description: "Ideal for black soil with high water retention",
          benefits: ["High yield", "Good market price", "Multiple uses", "Soil improvement"]
        },
        {
          name: "Wheat",
          variety: "HD-2967",
          plantingSeason: "Rabi",
          expectedYield: "4-5 tons/hectare",
          marketPrice: 2000,
          confidence: 0.85,
          description: "Excellent for black soil conditions",
          benefits: ["High protein content", "Good storage", "High demand", "Soil structure improvement"]
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
      laterite: [
        {
          name: "Cashew",
          variety: "Vengurla-4",
          plantingSeason: "Kharif",
          expectedYield: "8-10 tons/hectare",
          marketPrice: 12000,
          confidence: 0.80,
          description: "Suitable for laterite soil with good drainage",
          benefits: ["High value crop", "Drought tolerant", "Long-term investment", "Good market price"]
        },
        {
          name: "Mango",
          variety: "Alphonso",
          plantingSeason: "Kharif",
          expectedYield: "15-20 tons/hectare",
          marketPrice: 8000,
          confidence: 0.75,
          description: "Good for laterite soil conditions",
          benefits: ["High value fruit", "Export quality", "Long-term crop", "Good market demand"]
        }
      ],
      alluvial: [
        {
          name: "Rice",
          variety: "Pusa Basmati",
          plantingSeason: "Kharif",
          expectedYield: "5-6 tons/hectare",
          marketPrice: 2800,
          confidence: 0.90,
          description: "Perfect for alluvial soil with rich nutrients",
          benefits: ["High yield", "Premium quality", "Good market price", "Soil fertility"]
        },
        {
          name: "Wheat",
          variety: "HD-3086",
          plantingSeason: "Rabi",
          expectedYield: "4-5 tons/hectare",
          marketPrice: 2200,
          confidence: 0.85,
          description: "Excellent for alluvial soil conditions",
          benefits: ["High protein content", "Good storage", "High demand", "Soil improvement"]
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
        },
        {
          name: "Mustard",
          variety: "Pusa Bold",
          plantingSeason: "Rabi",
          expectedYield: "2-3 tons/hectare",
          marketPrice: 4000,
          confidence: 0.75,
          description: "Suitable for chalky soil with proper management",
          benefits: ["Oil crop", "Good market price", "Soil improvement", "Drought tolerant"]
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
      red: [
        {
          name: "NPK 19:19:19",
          type: "Complex",
          quantity: "50 kg/acre",
          applicationMethod: "Broadcasting",
          timing: "Before planting",
          benefits: "Balanced nutrition for red soil"
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
      black: [
        {
          name: "NPK 20:20:20",
          type: "Complex",
          quantity: "45 kg/acre",
          applicationMethod: "Broadcasting",
          timing: "Before planting",
          benefits: "Balanced nutrition for black soil"
        },
        {
          name: "Farm Yard Manure",
          type: "Organic",
          quantity: "3 tons/acre",
          applicationMethod: "Mixing with soil",
          timing: "Before planting",
          benefits: "Enhances soil fertility and water retention"
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
      ],
      laterite: [
        {
          name: "NPK 12:32:16",
          type: "Complex",
          quantity: "35 kg/acre",
          applicationMethod: "Broadcasting",
          timing: "Before planting",
          benefits: "Suitable for laterite soil with low fertility"
        },
        {
          name: "Lime",
          type: "Soil Conditioner",
          quantity: "150 kg/acre",
          applicationMethod: "Mixing with soil",
          timing: "Before planting",
          benefits: "Neutralizes soil acidity"
        }
      ],
      alluvial: [
        {
          name: "NPK 19:19:19",
          type: "Complex",
          quantity: "50 kg/acre",
          applicationMethod: "Broadcasting",
          timing: "Before planting",
          benefits: "Balanced nutrition for alluvial soil"
        },
        {
          name: "Green Manure",
          type: "Organic",
          quantity: "2 tons/acre",
          applicationMethod: "Mixing with soil",
          timing: "Before planting",
          benefits: "Improves soil structure and fertility"
        }
      ],
      chalky: [
        {
          name: "NPK 15:15:15",
          type: "Complex",
          quantity: "30 kg/acre",
          applicationMethod: "Broadcasting",
          timing: "Before planting",
          benefits: "Suitable for chalky soil conditions"
        },
        {
          name: "Sulfur",
          type: "Soil Conditioner",
          quantity: "100 kg/acre",
          applicationMethod: "Mixing with soil",
          timing: "Before planting",
          benefits: "Lowers soil pH for better nutrient availability"
        }
      ]
    };

    return fertilizerMap[soilType] || fertilizerMap.loamy;
  }

  /**
   * Get irrigation recommendations
   */
  getIrrigationRecommendations(frequency) {
    const freq = parseInt(frequency) || 2;
    
    // Determine irrigation category based on frequency per season (0-5 range)
    let category, method, waterRequirement, timing, tips;
    
    if (freq === 0) {
      // Rain-fed only (0 times per season)
      category = "Rain-fed Only";
      method = "Natural rainfall only";
      waterRequirement = "0 mm irrigation (rely on rainfall)";
      timing = "Based on natural rainfall patterns";
      tips = [
        "Rely entirely on natural rainfall",
        "Choose drought-resistant crop varieties",
        "Use water conservation techniques",
        "Monitor weather patterns closely",
        "Plan planting around rainy seasons",
        "Use mulching to retain soil moisture",
        "Consider crop rotation with drought-tolerant crops"
      ];
    } else if (freq === 1) {
      // Very low frequency (1 time per season)
      category = "Very Low Frequency";
      method = "Flood irrigation or basin irrigation";
      waterRequirement = "100-150 mm per session";
      timing = "Early morning, during critical growth stage";
      tips = [
        "Rely primarily on natural rainfall",
        "Use water conservation techniques",
        "Choose drought-resistant crop varieties",
        "Time irrigation for critical growth stage",
        "Use deep watering for root development",
        "Monitor soil moisture throughout season"
      ];
    } else if (freq === 2) {
      // Low frequency (2 times per season)
      category = "Low Frequency";
      method = "Flood irrigation or furrow irrigation";
      waterRequirement = "80-120 mm per session";
      timing = "Early morning or evening";
      tips = [
        "Deep watering for root development",
        "Use organic mulch to retain moisture",
        "Monitor weather patterns",
        "Irrigate during critical growth stages",
        "Check soil moisture before each irrigation",
        "Plan irrigation around rainfall events"
      ];
    } else if (freq === 3) {
      // Medium-low frequency (3 times per season)
      category = "Medium-Low Frequency";
      method = "Flood irrigation or furrow irrigation";
      waterRequirement = "60-90 mm per session";
      timing = "Early morning or evening";
      tips = [
        "Regular irrigation schedule",
        "Use soil moisture monitoring",
        "Adjust based on weather conditions",
        "Deep watering for root development",
        "Use efficient irrigation methods",
        "Monitor plant health regularly"
      ];
    } else if (freq === 4) {
      // Medium frequency (4 times per season)
      category = "Medium Frequency";
      method = "Sprinkler or furrow irrigation";
      waterRequirement = "40-70 mm per session";
      timing = "Early morning or evening";
      tips = [
        "Regular irrigation schedule",
        "Use soil moisture sensors",
        "Adjust based on weather conditions",
        "Monitor plant health regularly",
        "Use efficient irrigation methods",
        "Plan irrigation around crop growth stages"
      ];
    } else {
      // High frequency (5 times per season)
      category = "High Frequency";
      method = "Sprinkler or drip irrigation";
      waterRequirement = "30-50 mm per session";
      timing = "Early morning";
      tips = [
        "Frequent irrigation schedule",
        "Use drip irrigation for efficiency",
        "Monitor soil moisture regularly",
        "Avoid over-irrigation",
        "Use mulch to retain moisture",
        "Consider automated irrigation systems"
      ];
    }

    return {
      frequency: `${freq} times per season (${category})`,
      method: method,
      waterRequirement: waterRequirement,
      timing: timing,
      tips: tips
    };
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


