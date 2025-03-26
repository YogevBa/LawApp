import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, SIZES, FONTS } from './constants/theme';
import Button from './components/Button';
import Card from './components/Card';
import InputField from './components/InputField';

// This is a simple test file to ensure components render correctly
// You can delete this file after testing

export default function TestComponents() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Component Test</Text>
      
      <Card>
        <Text style={styles.subtitle}>Button Component</Text>
        <Button title="Primary Button" onPress={() => console.log('Pressed')} />
        <View style={styles.spacer} />
        <Button title="Secondary Button" type="secondary" onPress={() => console.log('Pressed')} />
        <View style={styles.spacer} />
        <Button title="Outline Button" type="outline" onPress={() => console.log('Pressed')} />
        <View style={styles.spacer} />
        <Button title="Disabled Button" disabled onPress={() => console.log('Pressed')} />
      </Card>
      
      <Card>
        <Text style={styles.subtitle}>Input Field Component</Text>
        <InputField 
          label="Test Input"
          placeholder="Enter text here"
        />
        <InputField 
          label="Test Input with Error"
          placeholder="Enter text here"
          error="This is an error message"
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.medium,
    backgroundColor: COLORS.background,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  subtitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  spacer: {
    height: SIZES.medium,
  },
});