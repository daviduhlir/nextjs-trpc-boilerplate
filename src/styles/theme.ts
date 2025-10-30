/**
 * Application theme
 * Define colors, spacing, fonts, breakpoints, and other design tokens
 */

const colors = {
  // Primary
  primary: '#0066cc',
  primaryLight: '#e6f0ff',
  primaryDark: '#003d99',

  // Secondary
  secondary: '#666',
  secondaryLight: '#f0f0f0',
  secondaryDark: '#333',

  // Status colors
  success: '#00a854',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',

  // Neutral
  white: '#ffffff',
  black: '#000000',
  gray: '#999',
  lightGray: '#f5f5f5',
  border: '#d9d9d9',

  // Text
  text: '#333333',
  textSecondary: '#666666',
  textDisabled: '#cccccc',
};

const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
};

const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1920px',
};

const fonts = {
  family: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
  },
  weight: {
    light: 300,
    normal: 400,
    semibold: 600,
    bold: 700,
  },
};

const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const radius = {
  none: '0',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

const transitions = {
  fast: '0.1s ease-in-out',
  base: '0.2s ease-in-out',
  slow: '0.3s ease-in-out',
};

export const theme = {
  colors,
  spacing,
  breakpoints,
  fonts,
  shadows,
  radius,
  transitions,
};

export type Theme = typeof theme;
