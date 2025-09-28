import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Thermometer, 
  Eye,
  RefreshCw,
  AlertCircle,
  MapPin
} from 'lucide-react';

const WeatherWidget = ({ location, className = '' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return CloudRain;
    } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
      return CloudSnow;
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast') || conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return Cloud;
    } else if (conditionLower.includes('thunderstorm') || conditionLower.includes('storm')) {
      return CloudRain; // Use rain icon for thunderstorms
    } else {
      return Sun;
    }
  };

  const getWeatherColor = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return 'from-blue-400 to-blue-600';
    } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
      return 'from-gray-300 to-gray-500';
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast') || conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return 'from-gray-400 to-gray-600';
    } else if (conditionLower.includes('thunderstorm') || conditionLower.includes('storm')) {
      return 'from-purple-500 to-indigo-600';
    } else {
      return 'from-yellow-400 to-orange-500';
    }
  };

  const fetchWeather = useCallback(async () => {
    // Use provided location or fallback to Delhi coordinates for testing
    const coords = location?.latitude && location?.longitude 
      ? { lat: location.latitude, lon: location.longitude }
      : { lat: 28.6139, lon: 77.2090 }; // Delhi coordinates as fallback
    
    if (!coords.lat || !coords.lon) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || '53e6e347b72a8674d71706ac07d2fc06';
      
      // Ensure coordinates are numbers
      const lat = parseFloat(coords.lat);
      const lon = parseFloat(coords.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid latitude or longitude values');
      }
      
      // Fetch current weather
      const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!currentWeatherResponse.ok) {
        throw new Error(`Weather API error: ${currentWeatherResponse.status}`);
      }
      
      const currentWeatherData = await currentWeatherResponse.json();
      
      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Process current weather data with proper error handling
      const processedWeather = {
        current: {
          temperature: Math.round(currentWeatherData.main?.temp || 0),
          humidity: currentWeatherData.main?.humidity || 0,
          condition: currentWeatherData.weather?.[0]?.description || 'Unknown',
          windSpeed: Math.round((currentWeatherData.wind?.speed || 0) * 3.6), // Convert m/s to km/h
          pressure: currentWeatherData.main?.pressure || 0,
          visibility: Math.round((currentWeatherData.visibility || 0) / 1000), // Convert m to km
          feelsLike: Math.round(currentWeatherData.main?.feels_like || 0),
          uvIndex: currentWeatherData.uvi || 0,
          cloudiness: currentWeatherData.clouds?.all || 0,
        },
        forecast: forecastData.list
          ?.filter((item, index) => index % 8 === 0) // Get daily forecasts (every 24 hours)
          ?.slice(0, 3) // Take next 3 days
          ?.map(item => ({
            date: new Date(item.dt * 1000),
            temperature: Math.round(item.main?.temp || 0),
            condition: item.weather?.[0]?.description || 'Unknown',
            precipitation: Math.round((item.pop || 0) * 100), // Convert probability to percentage
            humidity: item.main?.humidity || 0,
            windSpeed: Math.round((item.wind?.speed || 0) * 3.6),
          })) || []
      };

      setWeather(processedWeather);
      setLastUpdated(new Date());
    } catch (err) {
      setError(`Failed to fetch weather data: ${err.message}`);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeather();
  }, [location, fetchWeather]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <motion.div
        className={`card p-6 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Weather Error</h3>
        </div>
        <p className="text-sm text-gray-600 mt-2">{error}</p>
        <button
          onClick={fetchWeather}
          className="mt-3 text-sm text-primary-600 hover:text-primary-700"
        >
          Try again
        </button>
      </motion.div>
    );
  }

  if (!weather) {
    return (
      <motion.div
        className={`card p-6 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center space-x-2 text-gray-500">
          <MapPin className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Weather Forecast</h3>
        </div>
        <div className="text-gray-500 text-sm mt-2">No weather data available</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`card p-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-4"
        variants={itemVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <motion.button
            onClick={fetchWeather}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </motion.div>
        ) : weather ? (
          <motion.div
            key="weather"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Current Weather */}
            <motion.div
              className={`p-4 rounded-xl bg-gradient-to-r ${getWeatherColor(weather.current.condition)} text-white mb-4`}
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {React.createElement(getWeatherIcon(weather.current.condition), {
                      className: "h-6 w-6"
                    })}
                    <span className="text-sm font-medium capitalize">
                      {weather.current.condition}
                    </span>
                  </div>
                  <div className="text-3xl font-bold">
                    {weather.current.temperature || 0}°C
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center space-x-1 mb-1">
                    <Droplets className="h-4 w-4" />
                    <span>{weather.current.humidity || 0}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wind className="h-4 w-4" />
                    <span>{weather.current.windSpeed || 0} km/h</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Weather Details */}
            <motion.div
              className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Temperature</p>
                  <p className="text-sm font-medium">{weather.current.temperature || 0}°C</p>
                  {weather.current.feelsLike && weather.current.feelsLike !== 0 && (
                    <p className="text-xs text-gray-400">Feels like {weather.current.feelsLike}°C</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-sm font-medium">{weather.current.humidity || 0}%</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Wind Speed</p>
                  <p className="text-sm font-medium">{weather.current.windSpeed || 0} km/h</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Visibility</p>
                  <p className="text-sm font-medium">{weather.current.visibility || 0} km</p>
                </div>
              </div>

              {weather.current.pressure && weather.current.pressure > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">P</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pressure</p>
                    <p className="text-sm font-medium">{weather.current.pressure} hPa</p>
                  </div>
                </div>
              )}

              {weather.current.cloudiness !== undefined && weather.current.cloudiness > 0 && (
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Cloudiness</p>
                    <p className="text-sm font-medium">{weather.current.cloudiness}%</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 3-Day Forecast */}
            {weather.forecast && weather.forecast.length > 0 ? (
              <motion.div variants={itemVariants}>
                <h4 className="text-sm font-medium text-gray-700 mb-3">3-Day Forecast</h4>
                <div className="space-y-2">
                  {weather.forecast.map((day, index) => {
                    const WeatherIcon = getWeatherIcon(day.condition);
                    return (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <WeatherIcon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {day.date?.toLocaleDateString('en-US', { weekday: 'short' }) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600 capitalize">
                            {day.condition || 'Unknown'}
                          </span>
                          <span className="text-sm font-medium">
                            {day.temperature || 0}°C
                          </span>
                          {day.precipitation > 0 && (
                            <span className="text-xs text-blue-600">
                              {day.precipitation}%
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <h4 className="text-sm font-medium text-gray-700 mb-3">3-Day Forecast</h4>
                <div className="text-center py-4 text-gray-500 text-sm">
                  Forecast data not available
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="no-weather"
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-gray-500 text-sm">No weather data available</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeatherWidget;