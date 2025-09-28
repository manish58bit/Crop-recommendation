import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Home,
  History,
  Camera,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Safe translation hook
  let t;
  try {
    const translationHook = useTranslation();
    t = translationHook.t;
  } catch (error) {
    console.warn('Translation hook error:', error);
    t = (key, fallback) => fallback || key;
  }

  // Fallback for translation function
  const translate = (key, fallback) => {
    try {
      return t(key, fallback);
    } catch (error) {
      console.warn('Translation error:', error);
      return fallback || key;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const navItems = [
    { name: translate('nav_dashboard', 'Dashboard'), path: '/dashboard', icon: Home },
    { name: translate('nav_upload', 'Upload Image'), path: '/upload', icon: Camera },
    { name: translate('nav_history', 'History'), path: '/history', icon: History },
  ];

  const userMenuItems = [
    { name: translate('nav_profile', 'Profile'), path: '/profile', icon: User },
    { name: translate('nav_settings', 'Settings'), path: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    userMenuItems.push({ name: translate('nav_admin', 'Admin Panel'), path: '/admin', icon: Shield });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                CropAI
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.name} whileHover={{ y: -2 }}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Language Switch */}
              <div className="hidden md:block">
                <LanguageSwitch showLabel={false} className="w-32" />
              </div>
              {/* User Avatar */}
              <div className="relative">
                <motion.button
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large border border-gray-100 py-1 z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.name}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              to={item.path}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                      <div className="border-t border-gray-100 my-1"></div>
                      <motion.button
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        onClick={handleLogout}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{translate('nav_signout', 'Sign Out')}</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-2 rounded-lg hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                {translate('nav_signin', 'Sign In')}
              </Link>
              <Link
                to="/register"
                className="btn-primary px-4 py-2 text-sm"
              >
                {translate('nav_signup', 'Sign Up')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && isAuthenticated && (
            <motion.div
              className="md:hidden border-t border-gray-100 py-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                {/* Mobile Language Switch */}
                <motion.div 
                  className="px-4 py-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <LanguageSwitch showLabel={true} />
                </motion.div>
                <div className="border-t border-gray-100 my-2"></div>
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
