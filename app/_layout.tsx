import { DefaultTheme } from '@react-navigation/native';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import i18n, { LanguageProvider, useLanguage } from '../localization/i18n';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import store from '../store/store';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Create a component that will observe language changes and update screen options
  function ScreenOptionsUpdater() {
    const { t, locale } = useLanguage();
    
    useEffect(() => {
      // This will be triggered when language changes
      // We could force a navigation state update to refresh screen options
      const updateTitles = async () => {
        // Since we're using the functional pattern for our screen options,
        // they will automatically update when the component re-renders
        console.log(`Language changed to: ${locale}`);
      };
      
      updateTitles();
    }, [locale, t]);
    
    return null;
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <LanguageProvider>
        <ScreenOptionsUpdater />
        <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // This ensures back button shows proper screen name
        headerBackTitle: 'Back'
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="report-new-fine" 
          options={{ 
            headerTitle: i18n.t('reportNewFineTitle'),
            headerBackTitle: i18n.t('home'),
          }} 
        />
        <Stack.Screen 
          name="report-summary" 
          options={{ 
            headerTitle: i18n.t('fineReport'),
            headerBackTitle: i18n.t('back'),
          }} 
        />
        <Stack.Screen 
          name="additional-info" 
          options={{ 
            headerTitle: i18n.t('additionalInformation'),
            headerBackTitle: i18n.t('fineReport'),
          }} 
        />
        <Stack.Screen 
          name="options" 
          options={{ 
            headerTitle: i18n.t('options'),
            headerBackTitle: i18n.t('fineReport'),
          }} 
        />
        <Stack.Screen 
          name="cancellation-request" 
          options={{ 
            headerTitle: i18n.t('cancellationRequest'),
            headerBackTitle: i18n.t('options'),
          }} 
        />
        <Stack.Screen 
          name="confirmation" 
          options={{ 
            headerTitle: i18n.t('confirmation'),
            headerBackTitle: i18n.t('back'),
          }} 
        />
        <Stack.Screen 
          name="custom-case" 
          options={{ 
            headerTitle: i18n.t('customCase'),
            headerBackTitle: i18n.t('back'),
          }} 
        />
        <Stack.Screen 
          name="scan-barcode" 
          options={{ 
            headerTitle: i18n.t('scanBarcode'),
            headerBackTitle: i18n.t('back'),
          }} 
        />
        <Stack.Screen 
          name="upload-document" 
          options={({ navigation }) => ({ 
            headerTitle: i18n.t('uploadFineDocument'),
            headerBackTitle: i18n.t('back'),
          })} 
        />
        {/* Removed fines-list screen as it's replaced by (tabs)/fines.tsx */}
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerTitle: i18n.t('myProfile'),
            headerBackTitle: i18n.t('home'),
          }} 
        />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
      </LanguageProvider>
    </Provider>
  );
}
