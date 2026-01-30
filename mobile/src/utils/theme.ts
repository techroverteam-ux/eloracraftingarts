import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0ea5e9',
    primaryContainer: '#e0f2fe',
    secondary: '#64748b',
    secondaryContainer: '#f1f5f9',
    surface: '#ffffff',
    surfaceVariant: '#f8fafc',
    background: '#f8fafc',
    error: '#ef4444',
    errorContainer: '#fee2e2',
    success: '#22c55e',
    successContainer: '#dcfce7',
    warning: '#f59e0b',
    warningContainer: '#fef3c7',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#1e293b',
    onBackground: '#1e293b',
    onError: '#ffffff',
    outline: '#cbd5e1',
    outlineVariant: '#e2e8f0',
  },
  roundness: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};