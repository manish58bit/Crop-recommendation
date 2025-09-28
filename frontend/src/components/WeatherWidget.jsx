import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertCircle, MapPin } from "lucide-react";

// Weather images
import sunnyImg from "../assets/sunny.jpg" ;
import cloudyImg from "../assets/cloudy.jpg";
import rainImg from "../assets/rain.jpg";
import snowImg from "../assets/snow.jpg";
// Default fallback image
import defaultImg from "../assets/default.jpg";

const WeatherWidget = ({ className = "" }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeatherBackground = (condition) => {
    const conditionLower = condition?.toLowerCase() || "";

    try {
      if (conditionLower.includes("rain") || conditionLower.includes("drizzle") || conditionLower.includes("shower")) return rainImg;
      if (conditionLower.includes("snow") || conditionLower.includes("blizzard")) return snowImg;
      if (conditionLower.includes("cloud") || conditionLower.includes("overcast") || conditionLower.includes("mist") || conditionLower.includes("fog")) return cloudyImg;
      return sunnyImg;
    } catch {
      // Fallback if any asset is missing
      return defaultImg;
    }
  };

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || "53e6e347b72a8674d71706ac07d2fc06";

      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();

      const processedWeather = {
        location: data.name || "Current Location",
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        feelsLike: Math.round(data.main.feels_like),
      };

      setWeather(processedWeather);
    } catch (err) {
      setError(`Failed to fetch weather: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  if (loading || !weather) return <div className="text-center text-gray-500 py-10">Loading weather...</div>;

  if (error) {
    return (
      <motion.div
        className={`card p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Weather Error</h3>
        </div>
        <p className="text-sm text-red-700 mt-2">{error}</p>
        <button onClick={fetchWeather} className="mt-3 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition">
          Try Again
        </button>
      </motion.div>
    );
  }

  const bgImage = getWeatherBackground(weather.condition) || defaultImg;

  return (
    <motion.div
      className={`relative p-6 rounded-2xl shadow-lg ${className}`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl"></div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div className="flex items-center space-x-2 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <MapPin className="h-5 w-5" />
          <h3 className="text-xl font-bold">{weather.location}</h3>
        </motion.div>

        <motion.div className="flex items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <motion.img
            src={bgImage}
            alt="weather"
            className="h-24 w-24 rounded-full shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            onError={(e) => (e.target.src = defaultImg)} // fallback if image fails to load
          />
          <div className="ml-4">
            <motion.p className="text-lg font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {weather.condition}
            </motion.p>
            <motion.p className="text-5xl font-extrabold" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 120 }}>
              {weather.temperature}°C
            </motion.p>
            <motion.p className="text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              Feels like {weather.feelsLike}°C
            </motion.p>
            <motion.p className="text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              Humidity: {weather.humidity}%
            </motion.p>
            <motion.p className="text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              Wind: {weather.windSpeed} km/h
            </motion.p>
          </div>
        </motion.div>

        <motion.button
          onClick={fetchWeather}
          className="mt-4 px-3 py-1 bg-white bg-opacity-30 rounded hover:bg-opacity-50 transition flex items-center space-x-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="h-5 w-5" /> <span>Refresh</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
