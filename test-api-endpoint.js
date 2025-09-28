const axios = require('axios');

// Test the recommendation API endpoint with demo user
const testRecommendationAPI = async () => {
  try {
    console.log('🧪 Testing recommendation API endpoint...');
    
    // Use demo user for testing
    console.log('🔐 Logging in with demo user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');
    
    // Now test the recommendation API
    console.log('🌱 Testing recommendation API...');
    const recommendationData = {
      location: {
        latitude: 23.8,
        longitude: 86.8,
        address: 'Jamtara, India'
      },
      soilType: 'alluvial',
      area: 4.5,
      irrigationFrequency: '3',
      district: 'jamtara',
      pastCrops: []
    };
    
    console.log('📤 Sending request:', JSON.stringify(recommendationData, null, 2));
    
    const recommendationResponse = await axios.post('http://localhost:5000/api/recommend', recommendationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Recommendation API successful!');
    console.log('Response success:', recommendationResponse.data.success);
    console.log('Message:', recommendationResponse.data.message);
    
    if (recommendationResponse.data.data?.recommendation?.recommendations?.crops) {
      console.log('Crops received:', recommendationResponse.data.data.recommendation.recommendations.crops.length);
      console.log('First crop:', recommendationResponse.data.data.recommendation.recommendations.crops[0]?.name);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

// Run the test
testRecommendationAPI();