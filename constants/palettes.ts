// constants/palettes.ts
// Color palette definitions — only the fields that vary between themes.
// Everything else (text, borders, semantic colors) stays in theme.ts.

export type PaletteKey = 'violet' | 'matcha' | 'rose' | 'indigo' | 'ocean';

export type PaletteOverride = {
  bg: string;
  bgCard: string;
  bgSession: string;
  bgInput: string;
  purple: string;
  purpleDim: string;
  purpleBorder: string;
  purpleMid: string;
};

export type PaletteConfig = PaletteOverride & {
  key: PaletteKey;
  name: string;
  swatch: string;
};

export const PALETTES: Record<PaletteKey, PaletteConfig> = {
  violet: {
    key: 'violet',
    name: 'Violet',
    swatch: '#a78bfa',
    bg: '#140f1a',
    bgCard: '#1c1525',
    bgSession: '#100c14',
    bgInput: 'rgba(255,240,255,0.055)',
    purple: '#a78bfa',
    purpleDim: 'rgba(167,139,250,0.18)',
    purpleBorder: 'rgba(167,139,250,0.4)',
    purpleMid: '#7c5cbf',
  },
  matcha: {
    key: 'matcha',
    name: 'Matcha',
    swatch: '#6ee7b7',
    bg: '#0b1210',
    bgCard: '#111a16',
    bgSession: '#090e0d',
    bgInput: 'rgba(200,255,230,0.05)',
    purple: '#6ee7b7',
    purpleDim: 'rgba(110,231,183,0.16)',
    purpleBorder: 'rgba(110,231,183,0.38)',
    purpleMid: '#3d9e7a',
  },
  rose: {
    key: 'rose',
    name: 'Rose',
    swatch: '#fb7185',
    bg: '#1a0f12',
    bgCard: '#251518',
    bgSession: '#140c0e',
    bgInput: 'rgba(255,200,210,0.05)',
    purple: '#fb7185',
    purpleDim: 'rgba(251,113,133,0.18)',
    purpleBorder: 'rgba(251,113,133,0.4)',
    purpleMid: '#be4b60',
  },
  indigo: {
    key: 'indigo',
    name: 'Indigo',
    swatch: '#818cf8',
    bg: '#0f0e1a',
    bgCard: '#17162a',
    bgSession: '#0c0b15',
    bgInput: 'rgba(200,200,255,0.05)',
    purple: '#818cf8',
    purpleDim: 'rgba(129,140,248,0.18)',
    purpleBorder: 'rgba(129,140,248,0.4)',
    purpleMid: '#5b6bd4',
  },
  ocean: {
    key: 'ocean',
    name: 'Ocean',
    swatch: '#60a5fa',
    bg: '#0e1118',
    bgCard: '#141924',
    bgSession: '#0a0e14',
    bgInput: 'rgba(200,220,255,0.05)',
    purple: '#60a5fa',
    purpleDim: 'rgba(96,165,250,0.18)',
    purpleBorder: 'rgba(96,165,250,0.4)',
    purpleMid: '#2563eb',
  },
};

export const PALETTE_ORDER: PaletteKey[] = ['violet', 'matcha', 'rose', 'indigo', 'ocean'];
