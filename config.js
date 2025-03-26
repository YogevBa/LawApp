// This is a simple way to read environment variables at runtime
// without relying on babel plugins

import { Platform } from "react-native";

// For development purposes only - in production, use a secure backend
// Note: Exposing API keys in client-side code is not recommended for production apps
// API keys should be managed securely through a backend service
export const OPENAI_API_KEY = ""; // API key removed for security
export default {
  OPENAI_API_KEY: "", // API key removed for security
  API_URL: "https://api.openai.com/v1/chat/completions",
  DEFAULT_MODEL: "gpt-4o-mini",
  USE_MOCK_DATA: true, // Set to true to use mock data instead of API calls
};