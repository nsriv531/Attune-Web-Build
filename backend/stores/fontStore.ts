import { create } from 'zustand';

export interface FontOption {
  key: string;
  label: string;
  regular: string;
  semibold: string;
  bold: string;
  extrabold: string;
}

// Each entry lists the loaded font-family names for each weight.
// If a Google Fonts package isn't installed, the loader silently skips it
// and text falls back to the platform default — that still lets you preview
// every option side-by-side via the System fallback row.
export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'plus-jakarta',
    label: 'Plus Jakarta Sans',
    regular: 'PlusJakartaSans_400Regular',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_700Bold',
  },
  {
    key: 'inter',
    label: 'Inter',
    regular: 'Inter_400Regular',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extrabold: 'Inter_800ExtraBold',
  },
  {
    key: 'manrope',
    label: 'Manrope',
    regular: 'Manrope_400Regular',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extrabold: 'Manrope_800ExtraBold',
  },
  {
    key: 'dm-sans',
    label: 'DM Sans',
    regular: 'DMSans_400Regular',
    semibold: 'DMSans_600SemiBold',
    bold: 'DMSans_700Bold',
    extrabold: 'DMSans_700Bold',
  },
];

interface FontState {
  index: number;
  current: FontOption;
  cycle: () => void;
  setByKey: (key: string) => void;
}

export const useFontStore = create<FontState>((set, get) => ({
  index: 0,
  current: FONT_OPTIONS[0],
  cycle: () => {
    const next = (get().index + 1) % FONT_OPTIONS.length;
    set({ index: next, current: FONT_OPTIONS[next] });
  },
  setByKey: (key) => {
    const idx = FONT_OPTIONS.findIndex((f) => f.key === key);
    if (idx >= 0) set({ index: idx, current: FONT_OPTIONS[idx] });
  },
}));
