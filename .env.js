import { Platform } from 'react-native';

const ENV = {
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  API_URL: 'https://api.openai.com/v1/chat/completions',
  DEFAULT_MODEL: 'gpt-4o-mini',
  USE_MOCK_DATA: false,
};

export default ENV;