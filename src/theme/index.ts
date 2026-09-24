// One palette for every screen. Change a color here, the whole app updates.

export const Colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EEF3FF',

  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  background: '#F3F6FB',
  surface: '#FFFFFF',
  border: '#E6EAF2',
  dashed: '#C5D0E6',

  textPrimary: '#0F172A',
  textSecondary: '#5B6578',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

// Score bar/number color: green 75+, amber 50–74, red below 50.
export const scoreColor = (percent: number) => {
  if (percent >= 75) {
    return Colors.success;
  }
  if (percent >= 50) {
    return Colors.warning;
  }
  return Colors.danger;
};
