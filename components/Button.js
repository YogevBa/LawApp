import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const Button = ({ title, onPress, type = 'primary', width = '100%', disabled = false }) => {
  const buttonStyle = [
    styles.button,
    { width },
    type === 'primary' && styles.primaryButton,
    type === 'secondary' && styles.secondaryButton,
    type === 'outline' && styles.outlineButton,
    disabled && styles.disabledButton,
  ];

  const textStyle = [
    styles.text,
    type === 'primary' && styles.primaryText,
    type === 'secondary' && styles.secondaryText,
    type === 'outline' && styles.outlineText,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.extraLarge,
    borderRadius: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    ...SHADOWS.light,
  },
  text: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.gray,
  },
});

export default Button;