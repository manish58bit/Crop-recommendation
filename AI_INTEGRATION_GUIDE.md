# AI Model Integration Guide

## 🤖 Current AI Integration Status

The Crop Recommendation System now includes a comprehensive AI integration framework that can work with various AI models and services.

## 🏗️ Architecture

```
Frontend (React) → Backend (Express) → AI Service → AI Model
                                    ↓
                              Fallback System
```

## 📁 Key Files

### Backend AI Integration
- `backend/services/aiService.js` - Main AI service with fallback logic
- `backend/controllers/aiController.js` - AI health check and configuration
- `backend/routes/ai.js` - AI-related API endpoints
- `backend/mock-ai-server.js` - Mock AI server for testing

### Frontend AI Integration
- `frontend/src/pages/Dashboard.jsx` - AI status indicator and integration

## 🔧 Configuration

### Environment Variables
```env
# AI Model Configuration
AI_API_BASE_URL=http://localhost:5001  # Your AI model server URL
AI_API_TIMEOUT=30000                   # Request timeout in milliseconds
```

### AI Model Server Requirements
Your AI model server should implement these endpoints:

#### 1. Health Check
```
GET /health
Response: { status: 'healthy', service: 'AI Model', timestamp: '...' }
```

#### 2. Crop Recommendations
```
POST /recommend
Request Body:
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "soilType": "loamy",
  "area": 1.0,
  "irrigationFrequency": "weekly",
  "pastCrops": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}

Response:
{
  "crops": [
    {
      "name": "Tomato",
      "variety": "Hybrid",
      "plantingSeason": "Rabi",
      "expectedYield": "20-25 tons/hectare",
      "marketPrice": 3000,
      "confidence": 0.95,
      "description": "AI analysis description",
      "benefits": ["High yield", "Good market demand"],
      "aiInsights": ["Location analysis", "Soil analysis", "Market trends"]
    }
  ],
  "fertilizers": [...],
  "irrigation": {...},
  "aiAnalysis": {
    "soilHealth": "Good",
    "climateSuitability": "Excellent",
    "marketTrends": "Favorable",
    "riskAssessment": "Low"
  },
  "confidence": 0.92,
  "source": "ai_model"
}
```

## 🚀 Integration Steps

### 1. Start Mock AI Server (for testing)
```bash
cd backend
node mock-ai-server.js
```

### 2. Start Main Backend
```bash
cd backend
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

### 4. Test AI Integration
- Visit the dashboard
- Check AI status indicator (green = connected, red = fallback)
- Get recommendations to test AI model

## 🔄 Fallback System

If the AI model is unavailable, the system automatically falls back to:

1. **Soil-specific recommendations** based on soil type
2. **Seasonal recommendations** based on current date
3. **Regional recommendations** based on coordinates
4. **Combined ranking** by confidence score

## 🧪 Testing Your AI Model

### 1. Health Check
```bash
curl http://localhost:5001/health
```

### 2. Test Recommendation
```bash
curl -X POST http://localhost:5001/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6139,
    "longitude": 77.2090,
    "soilType": "loamy",
    "area": 1.0,
    "irrigationFrequency": "weekly",
    "pastCrops": []
  }'
```

### 3. Backend AI Health Check
```bash
curl http://localhost:5000/api/ai/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔌 Connecting Your AI Model

### Option 1: Replace Mock Server
1. Stop the mock AI server
2. Start your AI model server on port 5001
3. Ensure it implements the required endpoints

### Option 2: Different Port/URL
1. Update `AI_API_BASE_URL` in your `.env` file
2. Point to your AI model server URL
3. Restart the backend server

### Option 3: Cloud AI Service
1. Update `AI_API_BASE_URL` to your cloud AI service URL
2. Add authentication headers if required
3. Update the AI service configuration

## 📊 AI Model Features

### Supported Inputs
- **Location**: Latitude, longitude, address
- **Soil Type**: clay, sandy, loamy, silty, peaty, chalky
- **Area**: Farm size in acres
- **Irrigation**: daily, weekly, bi-weekly, monthly, seasonal
- **Past Crops**: Historical crop data

### Expected Outputs
- **Crops**: Top 3-5 crop recommendations with details
- **Fertilizers**: Recommended fertilizers and application methods
- **Irrigation**: Irrigation schedule and tips
- **AI Analysis**: Soil health, climate suitability, market trends
- **Confidence**: Overall recommendation confidence score

## 🛠️ Customization

### Adding New Soil Types
1. Update `soilTypes` array in frontend
2. Add soil-specific logic in `aiService.js`
3. Update validation in `validator.js`

### Adding New AI Features
1. Extend AI service with new methods
2. Add new API endpoints in `aiController.js`
3. Update frontend to display new features

### Performance Optimization
1. Implement caching for frequent requests
2. Add request batching for multiple recommendations
3. Use background processing for heavy AI computations

## 🔍 Monitoring

### AI Service Status
- Real-time status indicator in dashboard
- Health check endpoint for monitoring
- Fallback mode detection

### Logging
- AI API request/response logging
- Error tracking and fallback triggers
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **AI Model Not Responding**
   - Check AI server is running
   - Verify endpoint URLs
   - Check network connectivity

2. **Fallback Mode Always Active**
   - Verify AI_API_BASE_URL is correct
   - Check AI server health endpoint
   - Review error logs

3. **Slow Recommendations**
   - Increase AI_API_TIMEOUT
   - Optimize AI model performance
   - Implement caching

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=ai:*
```

## 📈 Future Enhancements

1. **Multiple AI Models**: Support for different AI providers
2. **A/B Testing**: Compare different AI models
3. **Real-time Learning**: Update recommendations based on user feedback
4. **Advanced Analytics**: Detailed AI performance metrics
5. **Model Versioning**: Support for different AI model versions

## 🤝 Contributing

To add support for a new AI model:

1. Create a new service class extending the base AI service
2. Implement the required methods
3. Add configuration options
4. Update the main AI service to use the new model
5. Add tests and documentation

---

**Note**: The current implementation includes a robust fallback system, so your application will continue to work even if the AI model is temporarily unavailable.



