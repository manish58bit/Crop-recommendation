const axios = require('axios');

// Test the recommendation API with the sample data
const testRecommendationAPI = async () => {
  try {
    console.log('Testing Recommendation API...');
    
    // Sample request data as provided by user
    const sampleData = {
      lat: 23.8,
      lon: 86.8,
      area: 4.5,
      irrigation: 3,
      district: "jamtara",
      soil_type: "alluvial"
    };

    // Convert to the format expected by our backend
    const requestData = {
      location: {
        latitude: sampleData.lat,
        longitude: sampleData.lon,
        address: `${sampleData.district}, India`
      },
      soilType: sampleData.soil_type,
      area: sampleData.area,
      irrigationFrequency: sampleData.irrigation.toString(),
      district: sampleData.district,
      pastCrops: []
    };

    console.log('Request data:', JSON.stringify(requestData, null, 2));

    // Test the AI service directly
    const aiServiceUrl = 'http://127.0.0.1:8000/recommend';
    console.log(`\nTesting AI API at: ${aiServiceUrl}`);
    
    try {
      const aiResponse = await axios.post(aiServiceUrl, {
        lat: sampleData.lat,
        lon: sampleData.lon,
        area: sampleData.area,
        irrigation: sampleData.irrigation,
        district: sampleData.district,
        soil_type: sampleData.soil_type
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ AI API Response:', JSON.stringify(aiResponse.data, null, 2));
    } catch (aiError) {
      console.log('❌ AI API Error:', aiError.message);
      if (aiError.response) {
        console.log('Response status:', aiError.response.status);
        console.log('Response data:', aiError.response.data);
      }
    }

    // Test our backend API (requires authentication)
    console.log('\nTesting Backend API...');
    console.log('Note: This requires authentication. Please test through the frontend.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run the test
testRecommendationAPI();
