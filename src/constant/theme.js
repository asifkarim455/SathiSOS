import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#3F72AF',
  secondary: '#112D4E',
  accent: '#FF4081',
  background: '#F9F7F7',
  surface: '#DBE2EF',
  text: '#212121',
  error: '#B00020',
};

export const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    error: COLORS.error,
  },
};
