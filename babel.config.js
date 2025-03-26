module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      'react-native-reanimated/plugin',
      // Enable inline environment variables for React Native
      ["transform-inline-environment-variables"]
    ],
  };
};