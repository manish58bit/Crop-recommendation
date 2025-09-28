const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Different port from main backend

// Middleware
app.use(cors());
app.use(express.json());

// Mock AI model data
const mockRecommendations = {
  clay: [
    {
      name: "Rice",
      variety: "Basmati",
      plantingSeason: "Kharif",
      expectedYield: "4-5 tons/hectare",
      marketPrice: 2500,
      confidence: 0.85,
      description: "AI Model: Excellent for clay soil with good water retention",
      benefits: ["High yield", "Good market price", "Drought resistant", "Soil improvement"]
    },
    {
      name: "Wheat",
      variety: "HD-2967",
      plantingSeason: "Rabi",
      expectedYield: "3-4 tons/hectare",
      marketPrice: 2000,
      confidence: 0.80,
      description: "AI Model: Well-suited for clay soil conditions",
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
      description: "AI Model: Perfect for sandy soil with good drainage",
      benefits: ["High oil content", "Good market price", "Drought tolerant", "Soil enrichment"]
    },
    {
      name: "Maize",
      variety: "Hybrid",
      plantingSeason: "Kharif",
      expectedYield: "5-6 tons/hectare",
      marketPrice: 1800,
      confidence: 0.75,
      description: "AI Model: Suitable for sandy soil with proper irrigation",
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
      description: "AI Model: Excellent for loamy soil with balanced nutrients",
      benefits: ["High yield", "Good market demand", "Multiple harvests", "High nutrition"]
    },
    {
      name: "Sugarcane",
      variety: "Co-86032",
      plantingSeason: "Kharif",
      expectedYield: "80-100 tons/hectare",
      marketPrice: 2800,
      confidence: 0.85,
      description: "AI Model: Ideal for loamy soil with good water retention",
      benefits: ["High sugar content", "Good market price", "Long-term crop", "Soil improvement"]
    }
  ]
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Mock AI Model Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Main recommendation endpoint
app.post('/recommend', (req, res) => {
  try {
    const { latitude, longitude, soilType, area, irrigationFrequency, pastCrops } = req.body;
    
    console.log('Mock AI received request:', {
      latitude,
      longitude,
      soilType,
      area,
      irrigationFrequency,
      pastCrops
    });

    // Simulate AI processing delay
    setTimeout(() => {
      const crops = mockRecommendations[soilType] || mockRecommendations.loamy;
      
      // Add some AI-specific enhancements
      const enhancedCrops = crops.map(crop => ({
        ...crop,
        description: `AI Model Analysis: ${crop.description}`,
        confidence: Math.min(0.95, crop.confidence + 0.05), // Slightly boost confidence
        aiInsights: [
          `Based on your location (${latitude}, ${longitude}), this crop is highly suitable`,
          `Soil analysis shows optimal conditions for ${crop.name}`,
          `Market trends indicate good pricing for ${crop.variety} variety`,
          `Weather patterns suggest ${crop.plantingSeason} season is ideal`
        ]
      }));

      const response = {
        crops: enhancedCrops,
        fertilizers: [
          {
            name: "AI-Recommended NPK",
            type: "Complex",
            quantity: "45 kg/acre",
            applicationMethod: "Precision application",
            timing: "Before planting",
            benefits: "AI-optimized nutrient balance for your soil type"
          },
          {
            name: "Smart Urea",
            type: "Nitrogen",
            quantity: "25 kg/acre",
            applicationMethod: "Controlled release",
            timing: "30 days after planting",
            benefits: "AI-calculated nitrogen requirement"
          }
        ],
        irrigation: {
          frequency: irrigationFrequency,
          method: "AI-optimized irrigation system",
          waterRequirement: "AI-calculated: 500-700 mm per season",
          timing: "AI-scheduled: Early morning or evening",
          tips: [
            "AI monitoring: Check soil moisture regularly",
            "Smart irrigation: Avoid over-irrigation",
            "AI recommendation: Use mulch to retain moisture",
            "Predictive analysis: Adjust based on weather forecast"
          ]
        },
        aiAnalysis: {
          soilHealth: "Good",
          climateSuitability: "Excellent",
          marketTrends: "Favorable",
          riskAssessment: "Low",
          recommendations: [
            "Your location is ideal for the recommended crops",
            "Soil conditions are optimal for high yield",
            "Market prices are currently favorable",
            "Weather patterns support successful cultivation"
          ]
        },
        confidence: 0.92,
        source: 'ai_model',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    }, 2000); // 2 second delay to simulate AI processing

  } catch (error) {
    console.error('Mock AI error:', error);
    res.status(500).json({
      error: 'AI model processing failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Mock AI Model Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 Recommendations: http://localhost:${PORT}/recommend`);
  console.log(`🔗 Main backend should connect to: http://localhost:${PORT}`);
});



