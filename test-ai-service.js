const aiService = require('./services/aiService');

// Test the AI service with actual API response format
const testAIService = async () => {
  try {
    console.log('Testing AI Service with actual API response...');
    
    // Sample data matching your request format
    const testData = {
      latitude: 23.8,
      longitude: 86.8,
      soilType: 'alluvial',
      area: 4.5,
      irrigationFrequency: '3',
      district: 'jamtara',
      pastCrops: []
    };

    console.log('Input data:', JSON.stringify(testData, null, 2));
    
    // Test the AI service
    const result = await aiService.getCropRecommendations(testData);
    
    console.log('\n✅ AI Service Result:');
    console.log('Success:', result.success);
    console.log('Source:', result.source);
    console.log('Data:', JSON.stringify(result.data, null, 2));
    
    if (result.error) {
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testAIService();
