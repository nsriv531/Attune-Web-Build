// constants/theme.ts
// Single source of truth for all design tokens

export const Colors = {
  // Backgrounds — Golden Hour light theme
  bg: '#FFF9E6',
  bgCard: '#FFFFFF',
  bgSession: '#FFF9E6',
  bgInput: 'rgba(131,85,0,0.06)',

  // Accent (golden amber — replacing "purple")
  purple: '#FDBA31',
  purpleDim: 'rgba(253,186,49,0.15)',
  purpleBorder: 'rgba(253,186,49,0.4)',
  purpleMid: '#E0A122',

  // Semantic
  green: '#4ade80',
  greenDim: 'rgba(74,222,128,0.14)',
  amber: '#FDBA31',
  amberDim: 'rgba(253,186,49,0.15)',
  teal: '#5eead4',
  red: '#f87171',

  // Text — warm charcoal for light theme
  textPrimary: '#1C1917',
  textSecondary: '#6B6865',
  textTertiary: '#A3A09D',
  textHint: '#D1CDCB',

  // Borders
  border: '#F2EBE5',
  borderMid: '#E6DDD5',

  // Glass effect
  bgGlass: 'rgba(255,255,255,0.6)',
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
