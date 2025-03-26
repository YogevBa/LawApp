// This is a simple way to read environment variables at runtime
// Access environment variables via the dotenv library

import { Platform } from "react-native";

// Load environment variables
import 'dotenv/config';

// Get API key from environment variables
export const OPENAI_API_KEY = process.env.EXPO_LOCAL_OPENAI_API_KEY;

export default {
  // Pass API key securely from environment variable
  OPENAI_API_KEY,
  API_URL: "https://api.openai.com/v1/chat/completions",
  DEFAULT_MODEL: "gpt-4o-mini",
  USE_MOCK_DATA: !OPENAI_API_KEY, // Use mock data only if API key is missing
};