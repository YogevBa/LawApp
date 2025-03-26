// This is a simple way to read environment variables at runtime
// without relying on babel plugins

import { Platform } from "react-native";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to load API key from AsyncStorage
export const getApiKey = async () => {
  try {
    // Try to get API key from AsyncStorage
    const storedApiKey = await AsyncStorage.getItem('@openai_api_key');
    if (storedApiKey) {
      return storedApiKey;
    }
    return ""; // Return empty string if not found
  } catch (error) {
    console.error('Error loading API key:', error);
    return "";
  }
};

// Function to save API key to AsyncStorage
export const saveApiKey = async (apiKey) => {
  try {
    await AsyncStorage.setItem('@openai_api_key', apiKey);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

// Default API key - empty for security
export const OPENAI_API_KEY = ""; // API key removed for security

// Main configuration object
export default {
  OPENAI_API_KEY: "", // API key removed for security
  API_URL: "https://api.openai.com/v1/chat/completions",
  DEFAULT_MODEL: "gpt-4o-mini",
  USE_MOCK_DATA: false, // Set to false to make real API calls
  
  // App configuration settings
  APP_NAME: "Legal AI",
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  BASENAME: Constants.expoConfig?.extra?.router?.basename || '/Legal.ai',
};