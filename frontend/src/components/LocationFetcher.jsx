import React, { useState } from 'react';
import { MapPin, Navigation, RefreshCw, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationFetcher = ({ 
  onLocationUpdate, 
  currentLocation, 
  showAddress = true, 
  showCoordinates = false,
  className = "",
  buttonText = "Detect Location",
  disabled = false,
  showCitySearch = true
}) => {
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [searchingCity, setSearchingCity] = useState(false);
  const [cityName, setCityName] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const locationData = {
            address: data.locality || `${latitude}, ${longitude}`,
            latitude: latitude,
            longitude: longitude
          };
          
          if (onLocationUpdate) {
            onLocationUpdate(locationData);
          }
          
          toast.success('Location detected successfully!');
        } catch (error) {
          console.error('Geocoding error:', error);
          const locationData = {
            address: `${latitude}, ${longitude}`,
            latitude: latitude,
            longitude: longitude
          };
          
          if (onLocationUpdate) {
            onLocationUpdate(locationData);
          }
          toast.success('Location detected!');
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enter manually.');
        setFetchingLocation(false);
      }
    );
  };

  const searchCityLocation = async () => {
    if (!cityName.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setSearchingCity(true);
    try {
      // Use OpenWeather Geocoding API to get coordinates from city name
      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || '53e6e347b72a8674d71706ac07d2fc06';
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName.trim())}&limit=1&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length === 0) {
        toast.error('City not found. Please try a different city name.');
        return;
      }

      const cityData = data[0];
      const locationData = {
        address: `${cityData.name}, ${cityData.state || ''}, ${cityData.country}`.replace(/,\s*,/g, ',').replace(/,$/, ''),
        latitude: cityData.lat,
        longitude: cityData.lon
      };

      if (onLocationUpdate) {
        onLocationUpdate(locationData);
      }

      setCityName('');
      setShowCityInput(false);
      toast.success(`Location found: ${locationData.address}`);
    } catch (error) {
      console.error('City search error:', error);
      toast.error('Failed to find city. Please try again.');
    } finally {
      setSearchingCity(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showAddress && (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {currentLocation?.address || 'Location not set'}
          </span>
        </div>
      )}
      
      {showCoordinates && currentLocation && (
        <div className="text-xs text-gray-500">
          {Number(currentLocation.latitude || 0).toFixed(4)}, {Number(currentLocation.longitude || 0).toFixed(4)}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          onClick={fetchCurrentLocation}
          disabled={fetchingLocation || disabled}
          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {fetchingLocation ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span>{buttonText}</span>
        </button>

        {showCitySearch && (
          <>
            {!showCityInput ? (
              <button
                onClick={() => setShowCityInput(true)}
                disabled={disabled}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Search className="h-4 w-4" />
                <span>Search City</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="Enter city name..."
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && searchCityLocation()}
                />
                <button
                  onClick={searchCityLocation}
                  disabled={searchingCity || disabled}
                  className="p-1 text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {searchingCity ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCityInput(false);
                    setCityName('');
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LocationFetcher;
