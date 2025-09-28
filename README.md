# AI Crop Recommendation System

A comprehensive MERN stack web application that provides AI-powered crop recommendations for farmers based on location, soil type, weather conditions, and farming preferences.

## 🌟 Features

### For Farmers
- **User Registration & Authentication** - Secure JWT-based authentication with geolocation
- **AI-Powered Crop Recommendations** - Get personalized crop suggestions based on multiple factors
- **Soil Image Analysis** - Upload soil photos for AI analysis and recommendations
- **Weather Integration** - Real-time weather data and forecasts
- **Recommendation History** - Track and manage past recommendations
- **Export Functionality** - Export recommendations in JSON/CSV format

### For Administrators
- **Admin Dashboard** - Comprehensive analytics and user management
- **User Management** - View, activate/deactivate, and delete users
- **System Analytics** - Usage statistics, popular crops, and trends
- **Recommendation Monitoring** - Track all system recommendations

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **Axios** - HTTP client for external APIs
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **React Dropzone** - File upload
- **Lucide React** - Icons

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-crop-recommendation
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file from env.example
   cp env.example .env
   
   # Update .env with your configuration
   MONGODB_URI=mongodb://localhost:27017/crop_recommendation
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   AI_API_BASE_URL=http://localhost:5000/ai
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ADMIN_EMAIL=admin@croprecommendation.com
   ADMIN_PASSWORD=admin123
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env file (optional)
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start the Application**
   
   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
ai-crop-recommendation/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── recommendController.js # Recommendation logic
│   │   ├── historyController.js  # History management
│   │   └── adminController.js    # Admin functionality
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Recommendation.js    # Recommendation model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── recommend.js         # Recommendation routes
│   │   ├── history.js           # History routes
│   │   └── admin.js             # Admin routes
│   ├── utils/
│   │   └── validator.js         # Input validation
│   ├── app.js                   # Express app configuration
│   ├── server.js                # Server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js           # API client configuration
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation component
│   │   │   ├── Footer.jsx       # Footer component
│   │   │   ├── RecommendationCard.jsx # Crop recommendation card
│   │   │   ├── WeatherWidget.jsx # Weather display
│   │   │   └── CropList.jsx     # Crop listing component
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── UploadImage.jsx  # Image upload page
│   │   │   ├── History.jsx      # Recommendation history
│   │   │   └── AdminPanel.jsx   # Admin dashboard
│   │   ├── styles/
│   │   │   └── index.css        # Global styles
│   │   ├── App.jsx              # Main app component
│   │   └── index.js             # App entry point
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Recommendations
- `POST /api/recommend` - Get crop recommendations
- `POST /api/recommend/upload-image` - Upload soil image for analysis
- `GET /api/recommend/:id` - Get specific recommendation

### History
- `GET /api/history` - Get user's recommendation history
- `GET /api/history/:id` - Get specific recommendation details
- `DELETE /api/history/:id` - Delete recommendation
- `GET /api/history/stats` - Get user statistics
- `GET /api/history/export` - Export history

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get specific user
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/recommendations` - Get all recommendations

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern Animations** - Smooth transitions and micro-interactions
- **Dark/Light Theme Support** - Customizable color schemes
- **Accessibility** - WCAG compliant components
- **Loading States** - Skeleton screens and progress indicators
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Server-side validation for all inputs
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Configuration** - Proper cross-origin resource sharing
- **Helmet Security** - Security headers and protection
- **File Upload Security** - Secure file handling and validation

## 🌐 Deployment

### Backend Deployment (Heroku/AWS/DigitalOcean)
1. Set up MongoDB Atlas
2. Configure environment variables
3. Deploy to your preferred platform
4. Set up CI/CD pipeline

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy to your preferred platform
3. Configure environment variables
4. Set up custom domain (optional)

### Environment Variables for Production
```env
# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crop_recommendation
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
AI_API_BASE_URL=https://your-ai-api.com
OPENWEATHER_API_KEY=your_openweather_api_key

# Frontend
REACT_APP_API_URL=https://your-backend-api.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenWeather API for weather data
- MongoDB Atlas for database hosting
- TailwindCSS for styling framework
- Framer Motion for animations
- Lucide for icons

## 📞 Support

For support, email support@cropai.com or create an issue in the repository.

---

**Built with ❤️ for farmers worldwide**



