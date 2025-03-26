// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native';

// Material Icons names type
type MaterialIconName = 'home' | 'send' | 'code' | 'chevron-right' | 'list' | 'person' | 'help';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING: Record<string, MaterialIconName> = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'list.bullet': 'list',
  'person.fill': 'person',
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export interface IconSymbolProps {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: IconSymbolProps) {
  // Default to 'help' icon if mapping not found
  const iconName: MaterialIconName = MAPPING[name as IconSymbolName] || 'help';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
