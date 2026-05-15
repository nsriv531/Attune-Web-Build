// components/SageOverlay.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SageAvatar } from './SageAvatar';
import { Typography, Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type SageState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate' | 'excessive_celebration';

interface SageOverlayProps {
  sageState: SageState;
  message: string;
  onDismiss?: () => void;
}

export function SageOverlay({ sageState, message, onDismiss }: SageOverlayProps) {
  const C = useThemeColors();
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  const stateBg: Record<SageState, string> = {
    idle:      C.bgCard,
    watching:  C.bgCard,
    nudge:     'rgba(251,191,36,0.08)',
    alert:     'rgba(248,113,113,0.08)',
    celebrate: 'rgba(74,222,128,0.08)',
    excessive_celebration: 'rgba(74,222,128,0.15)',
  };

  const stateBorder: Record<SageState, string> = {
    idle:      C.border,
    watching:  C.border,
    nudge:     'rgba(251,191,36,0.25)',
    alert:     'rgba(248,113,113,0.3)',
    celebrate: 'rgba(74,222,128,0.3)',
    excessive_celebration: 'rgba(74,222,128,0.5)',
  };

  const stateNameColor: Record<SageState, string> = {
    idle:      C.purple,
    watching:  C.purple,
    nudge:     C.amber,
    alert:     '#f87171',
    celebrate: C.green,
    excessive_celebration: C.green,
  };

  useEffect(() => {
    if (sageState !== 'idle') {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(10, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [sageState]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (sageState === 'idle') return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: stateBg[sageState],
          borderColor: stateBorder[sageState],
        },
        animStyle,
      ]}
    >
      <SageAvatar size={40} state={sageState} />
      <View style={styles.textWrap}>
        <Text style={[styles.name, { color: stateNameColor[sageState] }]}>Sage</Text>
        <Text style={[styles.message, { color: C.textSecondary }]} numberOfLines={2}>{message}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={[styles.dismiss, { color: C.textTertiary }]}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 0.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  message: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    lineHeight: 18,
  },
  dismiss: {
    fontSize: 12,
    paddingLeft: 4,
  },
});
