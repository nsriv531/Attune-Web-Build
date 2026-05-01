// hooks/useThemeColors.ts
import { Colors } from '@/constants/theme';
import { PALETTES } from '@/constants/palettes';
import { useThemeStore } from '@/stores/themeStore';

export type ThemeColors = typeof Colors;

export function useThemeColors(): ThemeColors {
  const paletteKey = useThemeStore((s) => s.paletteKey);
  const override = PALETTES[paletteKey];
  return {
    ...Colors,
    bg: override.bg,
    bgCard: override.bgCard,
    bgSession: override.bgSession,
    bgInput: override.bgInput,
    purple: override.purple,
    purpleDim: override.purpleDim,
    purpleBorder: override.purpleBorder,
    purpleMid: override.purpleMid,
  } as ThemeColors;
}
