const aiService = require('./services/aiService');

// Test with exact request and response format
const debugRecommendation = async () => {
  try {
    console.log('🔍 Debugging recommendation error...');
    
    // Exact request data as sent by backend
    const requestData = {
      latitude: 23.8,
      longitude: 86.8,
      soilType: 'alluvial',
      area: 4.5,
      irrigationFrequency: '3',
      district: 'jamtara',
      pastCrops: []
    };

    console.log('📤 Request data:', JSON.stringify(requestData, null, 2));
    
    // Test the AI service
    const result = await aiService.getCropRecommendations(requestData);
    
    console.log('\n📥 AI Service Result:');
    console.log('Success:', result.success);
    console.log('Source:', result.source);
    
    if (result.error) {
      console.log('❌ Error:', result.error);
    }
    
    if (result.data) {
      console.log('✅ Data received:');
      console.log('Crops count:', result.data.crops?.length || 0);
      console.log('First crop:', result.data.crops?.[0]?.name || 'N/A');
      console.log('Fertilizers count:', result.data.fertilizers?.length || 0);
      console.log('Irrigation:', result.data.irrigation ? 'Present' : 'Missing');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Run the debug test
debugRecommendation();
