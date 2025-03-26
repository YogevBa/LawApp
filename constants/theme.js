/**
 * @typedef {Object} Colors
 * @property {string} primary - Deep blue
 * @property {string} secondary - Blue
 * @property {string} accent - Green
 * @property {string} background - Light gray
 * @property {string} white - White
 * @property {string} black - Black
 * @property {string} text - Dark gray for text
 * @property {string} error - Red for errors
 * @property {string} success - Green for success messages
 * @property {string} warning - Amber for warnings
 * @property {string} gray - Gray for secondary text
 * @property {string} lightGray - Light gray for borders
 */

/**
 * @typedef {Object} Sizes
 * @property {number} base - Base size
 * @property {number} small - Small size
 * @property {number} font - Font size
 * @property {number} medium - Medium size
 * @property {number} large - Large size
 * @property {number} extraLarge - Extra large size
 * @property {number} xxl - XXL size
 * @property {number} xxxl - XXXL size
 */

/**
 * @typedef {Object} FontStyle
 * @property {string} fontFamily - Font family
 * @property {string} fontWeight - Font weight
 */

/**
 * @typedef {Object} Fonts
 * @property {FontStyle} bold - Bold font
 * @property {FontStyle} semiBold - Semi-bold font
 * @property {FontStyle} medium - Medium font
 * @property {FontStyle} regular - Regular font
 * @property {FontStyle} light - Light font
 */

/** @type {Colors} */
export const COLORS = {
  primary: '#1E3A8A',    // Deep blue
  secondary: '#3B82F6',  // Blue
  accent: '#10B981',     // Green
  background: '#F3F4F6', // Light gray
  white: '#FFFFFF',
  black: '#000000',
  text: '#1F2937',       // Dark gray for text
  error: '#EF4444',      // Red for errors
  success: '#10B981',    // Green for success messages
  warning: '#F59E0B',    // Amber for warnings
  gray: '#6B7280',       // Gray for secondary text
  lightGray: '#E5E7EB',  // Light gray for borders
};

/** @type {Sizes} */
export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  xxl: 32,
  xxxl: 40,
};

/** @type {Fonts} */
export const FONTS = {
  bold: { fontFamily: 'System', fontWeight: '700' },
  semiBold: { fontFamily: 'System', fontWeight: '600' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  regular: { fontFamily: 'System', fontWeight: '400' },
  light: { fontFamily: 'System', fontWeight: '300' },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  dark: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
};