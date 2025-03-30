import Constants from 'expo-constants';

const ENV = {
  OPENAI_API_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY || '',
  API_URL: 'https://api.openai.com/v1/chat/completions',
  DEFAULT_MODEL: 'gpt-4o-mini',
  USE_MOCK_DATA: false,
};

console.log('🔑 FINAL API KEY:', ENV.OPENAI_API_KEY); // Must log actual key

export default ENV;
