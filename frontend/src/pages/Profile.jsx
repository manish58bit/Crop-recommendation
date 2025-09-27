import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, MapPin, Phone, Mail } from 'lucide-react';
import { authAPI, handleApiError } from '../api/api';
import LocationFetcher from '../components/LocationFetcher';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    role: 'farmer',
    location: { address: 'Default Location', latitude: 28.6139, longitude: 77.2090 } 
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        const userData = res.data.data.user;
        setUser({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'farmer',
          location: {
            address: userData.location?.address || 'Default Location',
            latitude: userData.location?.latitude || 28.6139,
            longitude: userData.location?.longitude || 77.2090
          }
        });
      } else {
        toast.error(res.data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      const error = handleApiError(err);
      toast.error(error.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setUser({
        ...user,
        location: {
          ...user.location,
          [locationField]: value
        }
      });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  // Handle location update from LocationFetcher
  const handleLocationUpdate = (locationData) => {
    setUser(prev => ({
      ...prev,
      location: {
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      }
    }));
  };

  // Validate form data
  const validateForm = () => {
    if (!user.name || user.name.trim().length === 0) {
      toast.error('Name is required');
      return false;
    }
    
    if (user.phone && !/^[0-9]{10}$/.test(user.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }
    
    if (user.location?.latitude && (user.location.latitude < -90 || user.location.latitude > 90)) {
      toast.error('Latitude must be between -90 and 90');
      return false;
    }
    
    if (user.location?.longitude && (user.location.longitude < -180 || user.location.longitude > 180)) {
      toast.error('Longitude must be between -180 and 180');
      return false;
    }
    
    return true;
  };

  // Update profile
  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        name: user.name.trim(),
        phone: user.phone?.trim() || '',
        location: {
          address: user.location?.address?.trim() || '',
          latitude: user.location?.latitude || 0,
          longitude: user.location?.longitude || 0
        }
      };
      
      const res = await authAPI.updateProfile(updateData);
      if (res.data.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        // Refresh profile data
        await fetchProfile();
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (err) {
      const error = handleApiError(err);
      if (error.data?.errors) {
        // Handle validation errors from server
        error.data.errors.forEach(errorMsg => toast.error(errorMsg));
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            {user.role && (
              <span className="text-sm text-gray-500 capitalize">
                {user.role === 'admin' ? 'Administrator' : 'Farmer'}
              </span>
            )}
          </div>
          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={user.name || ''}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded ${
                editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
              }`}
              disabled={!editing}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email || ''}
              className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed border-gray-200"
              disabled
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={user.phone || ''}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded ${
                editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
              }`}
              disabled={!editing}
              placeholder="10-digit phone number"
            />
          </div>

          {/* Location Address */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location Address
            </label>
            <div className="space-y-2">
              <input
                type="text"
                name="location.address"
                value={user.location?.address || ''}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded ${
                  editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
                }`}
                disabled={!editing}
                placeholder="Enter your location address"
              />
              {editing && (
                <LocationFetcher
                  onLocationUpdate={handleLocationUpdate}
                  currentLocation={user.location}
                  showAddress={false}
                  showCoordinates={false}
                  buttonText="Detect Current Location"
                  disabled={!editing}
                  className="justify-start"
                />
              )}
            </div>
            {editing && (
              <p className="text-xs text-gray-500 mt-1">
                Click "Detect Current Location" to automatically detect your current location
              </p>
            )}
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Latitude</label>
              <input
                type="number"
                name="location.latitude"
                value={user.location?.latitude || ''}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded ${
                  editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
                }`}
                disabled={!editing}
                placeholder="28.6139"
                step="any"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Longitude</label>
              <input
                type="number"
                name="location.longitude"
                value={user.location?.longitude || ''}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded ${
                  editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
                }`}
                disabled={!editing}
                placeholder="77.2090"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  fetchProfile(); // Reset to original data
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
