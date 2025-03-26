import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { COLORS } from './constants/theme';
import store from './store/store';

const App = () => {
  return (
    <Provider store={store}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      {/* Expo Router will manage navigation */}
    </Provider>
  );
};

export default App;