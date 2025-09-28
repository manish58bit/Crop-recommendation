import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      recommendations: true,
      updates: true
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false,
      analytics: true
    },
    appearance: {
      theme: 'light',
      language: 'en',
      fontSize: 'medium'
    },
    data: {
      autoDelete: false,
      retentionPeriod: 30,
      exportFormat: 'json'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    setLoading(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setSaved(true);
      toast.success('Settings saved successfully');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <Icon className="h-5 w-5 text-primary-500 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-500' : 'bg-gray-200'
        }`}
        onClick={onChange}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectField = ({ value, onChange, options, label, description }) => (
    <div className="py-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Content */}
          <div className="lg:col-span-2">
            

            {/* <SettingSection title="Privacy & Security" icon={Shield}>
              <div className="space-y-1">
                <SelectField
                  value={settings.privacy.profileVisibility}
                  onChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                  options={[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' },
                    { value: 'friends', label: 'Friends Only' }
                  ]}
                  label="Profile Visibility"
                  description="Control who can see your profile information"
                />
                <ToggleSwitch
                  checked={settings.privacy.dataSharing}
                  onChange={() => handleSettingChange('privacy', 'dataSharing', !settings.privacy.dataSharing)}
                  label="Data Sharing"
                  description="Allow sharing of anonymized data for research"
                />
                <ToggleSwitch
                  checked={settings.privacy.analytics}
                  onChange={() => handleSettingChange('privacy', 'analytics', !settings.privacy.analytics)}
                  label="Analytics"
                  description="Help improve the app by sharing usage analytics"
                />
              </div>
            </SettingSection> */}

            <SettingSection title="Appearance" icon={Palette}>
              <div className="space-y-1">
                <SelectField
                  value={settings.appearance.theme}
                  onChange={(value) => handleSettingChange('appearance', 'theme', value)}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto' }
                  ]}
                  label="Theme"
                  description="Choose your preferred color scheme"
                />
                <SelectField
                  value={settings.appearance.language}
                  onChange={(value) => handleSettingChange('appearance', 'language', value)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'hi', label: 'Hindi' },
                    { value: 'es', label: 'Spanish' }
                  ]}
                  label="Language"
                  description="Select your preferred language"
                />
                <SelectField
                  value={settings.appearance.fontSize}
                  onChange={(value) => handleSettingChange('appearance', 'fontSize', value)}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ]}
                  label="Font Size"
                  description="Adjust the text size for better readability"
                />
              </div>
            </SettingSection>

            <SettingSection title="Notifications" icon={Bell}>
              <div className="space-y-1">
                <ToggleSwitch
                  checked={settings.notifications.email}
                  onChange={() => handleSettingChange('notifications', 'email', !settings.notifications.email)}
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
                <ToggleSwitch
                  checked={settings.notifications.push}
                  onChange={() => handleSettingChange('notifications', 'push', !settings.notifications.push)}
                  label="Push Notifications"
                  description="Receive browser push notifications"
                />
                <ToggleSwitch
                  checked={settings.notifications.recommendations}
                  onChange={() => handleSettingChange('notifications', 'recommendations', !settings.notifications.recommendations)}
                  label="Recommendation Alerts"
                  description="Get notified about new crop recommendations"
                />
                <ToggleSwitch
                  checked={settings.notifications.updates}
                  onChange={() => handleSettingChange('notifications', 'updates', !settings.notifications.updates)}
                  label="App Updates"
                  description="Receive notifications about app updates"
                />
              </div>
            </SettingSection>

            <SettingSection title="Data Management" icon={Database}>
              <div className="space-y-1">
                <ToggleSwitch
                  checked={settings.data.autoDelete}
                  onChange={() => handleSettingChange('data', 'autoDelete', !settings.data.autoDelete)}
                  label="Auto-delete Old Data"
                  description="Automatically delete data older than specified period"
                />
                {settings.data.autoDelete && (
                  <SelectField
                    value={settings.data.retentionPeriod}
                    onChange={(value) => handleSettingChange('data', 'retentionPeriod', parseInt(value))}
                    options={[
                      { value: 7, label: '7 days' },
                      { value: 30, label: '30 days' },
                      { value: 90, label: '90 days' },
                      { value: 365, label: '1 year' }
                    ]}
                    label="Retention Period"
                    description="How long to keep your data"
                  />
                )}
                <SelectField
                  value={settings.data.exportFormat}
                  onChange={(value) => handleSettingChange('data', 'exportFormat', value)}
                  options={[
                    { value: 'json', label: 'JSON' },
                    { value: 'csv', label: 'CSV' },
                    { value: 'pdf', label: 'PDF' }
                  ]}
                  label="Export Format"
                  description="Default format for data exports"
                />
              </div>
            </SettingSection>
          </div>

          {/* Save Button Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 sticky top-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Settings</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your settings are automatically saved locally. Click save to apply changes.
              </p>
              
              <motion.button
                onClick={saveSettings}
                disabled={loading}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  saved
                    ? 'bg-green-500 text-white'
                    : loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
                whileHover={{ scale: saved ? 1 : 1.02 }}
                whileTap={{ scale: saved ? 1 : 0.98 }}
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </motion.button>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Account Info</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {user?.role === 'admin' ? 'Administrator' : 'Farmer'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
