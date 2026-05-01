// constants/theme.ts
// Single source of truth for all design tokens

export const Colors = {
  // Backgrounds — Golden Hour light theme
  bg: '#FFF9F0',
  bgCard: '#FFFFFF',
  bgSession: '#FFF9F0',
  bgInput: 'rgba(131,85,0,0.06)',

  // Accent (golden amber — replacing "purple")
  purple: '#E69B2E',
  purpleDim: 'rgba(255,183,77,0.18)',
  purpleBorder: 'rgba(255,183,77,0.4)',
  purpleMid: '#C4870A',

  // Semantic
  green: '#4ade80',
  greenDim: 'rgba(74,222,128,0.14)',
  amber: '#FFB74D',
  amberDim: 'rgba(251,191,36,0.14)',
  teal: '#5eead4',
  red: '#f87171',

  // Text — warm charcoal for light theme
  textPrimary: '#1C1917',
  textSecondary: 'rgba(28,25,23,0.6)',
  textTertiary: 'rgba(28,25,23,0.38)',
  textHint: 'rgba(28,25,23,0.2)',

  // Borders
  border: 'rgba(0,0,0,0.07)',
  borderMid: 'rgba(0,0,0,0.12)',

  // Glass effect
  bgGlass: 'rgba(255,255,255,0.4)',
} as const;

export const Typography = {
  fontSans: 'PlusJakartaSans_400Regular',
  fontMono: 'PlusJakartaSans_600SemiBold',

  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 15,
    lg: 17,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
    '4xl': 44,
  },

  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

// Timer ring geometry — used across TimerRing + session store
export const RING_RADIUS = 104;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
export const RING_SIZE = 240;
