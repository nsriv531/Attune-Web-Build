// hooks/useThemeColors.ts
import { Colors } from '@/constants/theme';
import { PALETTES } from '@/constants/palettes';
import { useThemeStore } from '@/backend/stores/themeStore';

export type ThemeColors = typeof Colors;

export function useThemeColors(): ThemeColors {
  const paletteKey = useThemeStore((s) => s.paletteKey);
  const override = PALETTES[paletteKey];
  return {
    ...Colors,
  } as ThemeColors;
}
