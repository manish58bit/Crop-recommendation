import React, { useState } from 'react';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationFetcher = ({ 
  onLocationUpdate, 
  currentLocation, 
  showAddress = true, 
  showCoordinates = false,
  className = "",
  buttonText = "Detect Location",
  disabled = false
}) => {
  const [fetchingLocation, setFetchingLocation] = useState(false);

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

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
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
          {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}
        </div>
      )}
      
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
    </div>
  );
};

export default LocationFetcher;
