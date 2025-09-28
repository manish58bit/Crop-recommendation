import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle = ({ className = '', showLabel = true }) => {
  const { theme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Safe translation hook
  let t;
  try {
    const translationHook = useTranslation();
    t = translationHook.t;
  } catch (error) {
    console.warn('Translation hook error:', error);
    t = (key, fallback) => fallback || key;
  }

  const themes = [
    { value: 'light', label: t('theme_light', 'Light'), icon: Sun },
    { value: 'dark', label: t('theme_dark', 'Dark'), icon: Moon },
    { value: 'auto', label: t('theme_auto', 'Auto'), icon: Monitor }
  ];

  const currentTheme = themes.find(t => t.value === theme);

  const handleThemeChange = (themeValue) => {
    // Add smooth transition animation
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    changeTheme(themeValue);
    setIsOpen(false);
    
    // Remove transition after animation completes
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('theme_label', 'Theme')}
        </label>
      )}
      
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center">
            {currentTheme && (
              <>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <currentTheme.icon className="h-4 w-4 text-gray-500 mr-2" />
                </motion.div>
                <span className="text-sm font-medium">
                  {currentTheme.label}
                </span>
              </>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ 
                duration: 0.2, 
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
            >
              {themes.map((themeOption, index) => (
                <motion.button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    theme === themeOption.value 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ rotate: theme === themeOption.value ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <themeOption.icon className="h-4 w-4 text-gray-500 mr-2" />
                  </motion.div>
                  <div>
                    <div className="text-sm font-medium">{themeOption.label}</div>
                  </div>
                  {theme === themeOption.value && (
                    <motion.div 
                      className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-0"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
