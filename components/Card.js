import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginVertical: SIZES.base,
    ...SHADOWS.medium,
  },
});

export default Card;