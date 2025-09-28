import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      // Only change language if i18n is ready
      if (i18n.isInitialized) {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, []);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    // Only change language if i18n is ready
    if (i18n.isInitialized) {
      i18n.changeLanguage(languageCode);
    }
    localStorage.setItem('selectedLanguage', languageCode);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
