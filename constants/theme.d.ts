export interface FontStyle {
  fontFamily: string;
  fontWeight: string;
}

export interface Fonts {
  bold: FontStyle;
  semiBold: FontStyle;
  medium: FontStyle;
  regular: FontStyle;
  light: FontStyle;
}

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  white: string;
  black: string;
  text: string;
  error: string;
  success: string;
  warning: string;
  gray: string;
  lightGray: string;
}

export interface Sizes {
  base: number;
  small: number;
  font: number;
  medium: number;
  large: number;
  extraLarge: number;
  xxl: number;
  xxxl: number;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  light: ShadowStyle;
  medium: ShadowStyle;
  dark: ShadowStyle;
}

export declare const COLORS: Colors;
export declare const FONTS: Fonts | any;
export declare const SIZES: Sizes;
export declare const SHADOWS: Shadows;