// constants/theme.ts
// Single source of truth for all design tokens

export const Colors = {
  // Backgrounds — warm plum palette
  bg: '#140f1a',
  bgCard: '#1c1525',
  bgSession: '#100c14',
  bgInput: 'rgba(255,240,255,0.055)',

  // Accent
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.18)',
  purpleBorder: 'rgba(167,139,250,0.4)',
  purpleMid: '#7c5cbf',

  // Semantic
  green: '#4ade80',
  greenDim: 'rgba(74,222,128,0.14)',
  amber: '#fbbf24',
  amberDim: 'rgba(251,191,36,0.14)',
  teal: '#5eead4',
  red: '#f87171',

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.55)',
  textTertiary: 'rgba(255,255,255,0.28)',
  textHint: 'rgba(255,255,255,0.16)',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.14)',
} as const;

export const Typography = {
  fontSans: 'DMSans',
  fontMono: 'DMMono',

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
