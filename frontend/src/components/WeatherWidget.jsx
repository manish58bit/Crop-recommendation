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
  AlertCircle
} from 'lucide-react';

const WeatherWidget = ({ location, className = '' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return CloudRain;
    } else if (conditionLower.includes('snow')) {
      return CloudSnow;
    } else if (conditionLower.includes('cloud')) {
      return Cloud;
    } else {
      return Sun;
    }
  };

  const getWeatherColor = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'from-blue-400 to-blue-600';
    } else if (conditionLower.includes('snow')) {
      return 'from-gray-300 to-gray-500';
    } else if (conditionLower.includes('cloud')) {
      return 'from-gray-400 to-gray-600';
    } else {
      return 'from-yellow-400 to-orange-500';
    }
  };

  const fetchWeather = useCallback(async () => {
    if (!location?.latitude || !location?.longitude) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual weather API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock weather data - replace with actual API call
      const mockWeather = {
        current: {
          temperature: Math.round(Math.random() * 20 + 15), // 15-35°C
          humidity: Math.round(Math.random() * 40 + 40), // 40-80%
          condition: ['Clear sky', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
          windSpeed: Math.round(Math.random() * 15 + 5), // 5-20 km/h
          pressure: Math.round(Math.random() * 50 + 1000), // 1000-1050 hPa
          visibility: Math.round(Math.random() * 5 + 8), // 8-13 km
        },
        forecast: [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            temperature: Math.round(Math.random() * 20 + 15),
            condition: ['Clear sky', 'Partly cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
            precipitation: Math.round(Math.random() * 20),
          },
          {
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            temperature: Math.round(Math.random() * 20 + 15),
            condition: ['Clear sky', 'Partly cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
            precipitation: Math.round(Math.random() * 20),
          },
          {
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            temperature: Math.round(Math.random() * 20 + 15),
            condition: ['Clear sky', 'Partly cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
            precipitation: Math.round(Math.random() * 20),
          },
        ]
      };

      setWeather(mockWeather);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch weather data');
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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (error) {
    return (
      <motion.div
        className={`card p-6 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Weather data unavailable</span>
        </div>
        <button
          onClick={fetchWeather}
          className="mt-3 text-sm text-primary-600 hover:text-primary-700"
        >
          Try again
        </button>
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
            className="flex items-center justify-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
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
                    {weather.current.temperature}°C
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center space-x-1 mb-1">
                    <Droplets className="h-4 w-4" />
                    <span>{weather.current.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wind className="h-4 w-4" />
                    <span>{weather.current.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Weather Details */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-4"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Temperature</p>
                  <p className="text-sm font-medium">{weather.current.temperature}°C</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-sm font-medium">{weather.current.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Wind Speed</p>
                  <p className="text-sm font-medium">{weather.current.windSpeed} km/h</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Visibility</p>
                  <p className="text-sm font-medium">{weather.current.visibility} km</p>
                </div>
              </div>
            </motion.div>

            {/* 3-Day Forecast */}
            {weather.forecast && (
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
                            {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600 capitalize">
                            {day.condition}
                          </span>
                          <span className="text-sm font-medium">
                            {day.temperature}°C
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
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeatherWidget;
