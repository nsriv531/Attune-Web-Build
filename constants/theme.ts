// constants/theme.ts
// Single source of truth for all design tokens — Milk & Honey Keycap theme

export const Colors = {
  // Backgrounds — clean milk white, neutral and minimalist
  bg: '#F9F8F6',
  bgCard: '#F1F0EE',
  bgCardHigh: '#FFFFFF',
  bgSession: '#F9F8F6',
  bgInput: 'rgba(0,0,0,0.055)',

  // Accent — golden amber honey (primary interactive color)
  purple: '#E8A020',
  purpleDim: 'rgba(232,160,32,0.16)',
  purpleBorder: 'rgba(232,160,32,0.45)',
  purpleMid: '#B87C08',

  // Amber aliases (for code that uses amber explicitly)
  amber: '#E8A020',
  amberDark: '#B87C08',
  amberLight: '#F5B830',
  amberDim: 'rgba(232,160,32,0.16)',
  amberBorder: 'rgba(232,160,32,0.45)',

  // Semantic
  green: '#4ade80',
  greenDim: 'rgba(74,222,128,0.14)',
  teal: '#5eead4',
  red: '#f87171',

  // Text — warm dark ink on cream
  textPrimary: '#2C2820',
  textSecondary: 'rgba(44,40,32,0.60)',
  textTertiary: 'rgba(44,40,32,0.38)',
  textHint: 'rgba(44,40,32,0.16)',

  // Borders — very soft warm edge
  border: 'rgba(44,40,32,0.09)',
  borderMid: 'rgba(44,40,32,0.14)',

  // Glass effect
  bgGlass: 'rgba(255,255,255,0.55)',

  // Keycap depth system — the "stem" color visible below the keycap face
  // Used by KeycapSurface as the outer wrapper background
  keycapDepthColor: 'rgba(180,175,165,0.55)',
  keycapAccentDepthColor: 'rgba(130,72,0,0.45)',
  keycapPressedDepthColor: 'rgba(175,158,128,0.30)',

  // Keycap highlight — top shine stripe on each key
  keycapHighlight: 'rgba(255,255,255,0.85)',
  keycapAccentHighlight: 'rgba(255,245,160,0.55)',

  // Ambient shadow
  keycapShadowColor: '#000',
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
    bold: '700' as const,
    extrabold: '800' as const,
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
  '2xl': 22,
  full: 999,
} as const;

// Timer ring geometry — v3 design values
export const RING_RADIUS = 86;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
export const RING_SIZE = 200;
