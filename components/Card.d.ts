import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}


declare const Card: React.FC<CardProps>;

export default Card;