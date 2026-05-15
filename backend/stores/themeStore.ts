// stores/themeStore.ts
import { create } from 'zustand';
import type { PaletteKey } from '@/constants/palettes';

interface ThemeState {
  paletteKey: PaletteKey;
  setPalette: (key: PaletteKey) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  paletteKey: 'violet',
  setPalette: (paletteKey) => set({ paletteKey }),
}));
