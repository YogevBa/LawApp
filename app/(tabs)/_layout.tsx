import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/localization/i18n';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Set headerShown to true to show header titles in tab screens
        headerShown: true, 
        // Style headers to match the app theme
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontFamily: 'System',
          fontWeight: '600',
        },
        // Use proper header back buttons when navigating within tabs
        // Always use English for tab labels regardless of language setting
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
          fontSize: 12,
        },
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home', // Always English
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Image 
                source={require('@/assets/images/icon.png')} 
                style={styles.headerIcon} 
              />
              <ThemedText type="title" style={styles.headerTitle}>Legal AI</ThemedText>
            </View>
          ),
          tabBarLabel: 'Home', // Always English
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="fines"
        options={{
          title: 'My Fines', // Always English
          headerTitle: 'My Fines', // Always English 
          tabBarLabel: 'My Fines', // Always English
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile', // Always English
          headerTitle: 'My Profile', // Always English
          tabBarLabel: 'Profile', // Always English
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color as string} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
  }
});
