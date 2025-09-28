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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setUser({ ...user, location: { ...user.location, [locationField]: value } });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleLocationUpdate = (locationData) => {
    setUser(prev => ({ ...prev, location: locationData }));
  };

  const validateForm = () => {
    if (!user.name?.trim()) { toast.error('Name is required'); return false; }
    if (user.phone && !/^[0-9]{10}$/.test(user.phone)) { toast.error('Phone must be 10 digits'); return false; }
    if (user.location?.latitude < -90 || user.location?.latitude > 90) { toast.error('Latitude must be between -90 and 90'); return false; }
    if (user.location?.longitude < -180 || user.location?.longitude > 180) { toast.error('Longitude must be between -180 and 180'); return false; }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      const updateData = {
        name: user.name.trim(),
        phone: user.phone?.trim() || '',
        location: { ...user.location }
      };
      const res = await authAPI.updateProfile(updateData);
      if (res.data.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        await fetchProfile();
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (err) {
      const error = handleApiError(err);
      if (error.data?.errors) error.data.errors.forEach(msg => toast.error(msg));
      else toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative hover:shadow-2xl transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div className="flex items-center justify-between mb-6" layout>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            {user.role && (
              <span className="text-sm text-gray-500 capitalize">
                {user.role === 'admin' ? 'Administrator' : 'Farmer'}
              </span>
            )}
          </div>
          {editing && (
            <motion.button
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-gray-600"
              whileHover={{ scale: 1.2 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </motion.div>

        <div className="space-y-4">
          {/** Name **/}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <User className="h-4 w-4 mr-2" /> Name
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              disabled={!editing}
              className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
              }`}
            />
          </motion.div>

          {/** Email **/}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <Mail className="h-4 w-4 mr-2" /> Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              disabled
              className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed border-gray-200"
            />
          </motion.div>

          {/** Phone **/}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <Phone className="h-4 w-4 mr-2" /> Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              disabled={!editing}
              placeholder="10-digit phone number"
              className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
              }`}
            />
          </motion.div>

          {/** Location **/}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <label className="block mb-1 font-semibold text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-2" /> Location
            </label>
            <div className="space-y-2">
              <input
                type="text"
                name="location.address"
                value={user.location?.address || ''}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your location address"
                className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                  editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
                }`}
              />
              {editing && (
                <LocationFetcher
                  onLocationUpdate={handleLocationUpdate}
                  currentLocation={user.location}
                  showAddress={false}
                  showCoordinates={false}
                  showCitySearch={true}
                  buttonText="Detect Current Location"
                  disabled={!editing}
                  className="justify-start"
                />
              )}
            </div>
          </motion.div>

          {/** Coordinates **/}
          <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Latitude</label>
              <input
                type="number"
                name="location.latitude"
                value={user.location?.latitude || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                  editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
                }`}
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
                disabled={!editing}
                className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                  editing ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed border-gray-200'
                }`}
                step="any"
              />
            </div>
          </motion.div>
        </div>

        {/** Actions **/}
        <motion.div className="mt-6 flex justify-end space-x-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          {!editing ? (
            <motion.button
              onClick={() => setEditing(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Profile
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={() => { setEditing(false); fetchProfile(); }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={updating}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
