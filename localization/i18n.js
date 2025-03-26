import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import React, { createContext, useState, useContext, useEffect } from 'react';

// Import translations
import en from './languages/en';
import he from './languages/he';

// Create i18n instance
const i18n = new I18n({
  en,
  he,
});

// Set the locale once at the beginning of your app
i18n.defaultLocale = 'en';

// Language context
export const LanguageContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: (key) => '',
});

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage) {
          changeLanguage(savedLanguage);
        } else {
          // Otherwise use device locale
          const deviceLocale = Localization.locale.split('-')[0]; // Get language code (en, he, etc.)
          const initialLocale = deviceLocale === 'he' ? 'he' : 'en'; // Default to English for other languages
          changeLanguage(initialLocale);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  // Set the language
  const changeLanguage = async (languageCode) => {
    try {
      // Set the language in state
      setLocale(languageCode);
      
      // Set the language in i18n
      i18n.locale = languageCode;
      
      // Force RTL or LTR based on language
      const isRTLLanguage = languageCode === 'he';
      I18nManager.forceRTL(isRTLLanguage);
      
      // Save language preference
      await AsyncStorage.setItem('user-language', languageCode);
      
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  };

  // Translation function
  const t = (key) => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Determine if device is set to use RTL
const isRTL = Localization.isRTL;

// Enable fallbacks if you want
i18n.enableFallback = true;

// For backwards compatibility, we still export the i18n instance
export default i18n;

// And we export the standalone change language function for components that don't use the context
export const changeLanguage = async (languageCode) => {
  try {
    // Set the language in i18n
    i18n.locale = languageCode;
    
    // Force RTL or LTR based on language
    const isRTLLanguage = languageCode === 'he';
    I18nManager.forceRTL(isRTLLanguage);
    
    // Save language preference
    await AsyncStorage.setItem('user-language', languageCode);
    
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};