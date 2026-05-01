import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SoliAvatar, SoliState } from './SoliAvatar';
import { Typography, Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SoliOverlayProps {
  soliState: SoliState;
  message: string;
  onDismiss?: () => void;
}

export function SoliOverlay({ soliState, message, onDismiss }: SoliOverlayProps) {
  const C = useThemeColors();
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  const stateBg: Record<SoliState, string> = {
    idle:      C.bgCard,
    watching:  C.bgCard,
    nudge:     'rgba(251,191,36,0.08)',
    alert:     'rgba(248,113,113,0.08)',
    celebrate: 'rgba(74,222,128,0.08)',
  };

  const stateBorder: Record<SoliState, string> = {
    idle:      C.border,
    watching:  C.border,
    nudge:     'rgba(251,191,36,0.25)',
    alert:     'rgba(248,113,113,0.3)',
    celebrate: 'rgba(74,222,128,0.3)',
  };

  const stateNameColor: Record<SoliState, string> = {
    idle:      C.purple,
    watching:  C.purple,
    nudge:     C.amber,
    alert:     '#f87171',
    celebrate: C.green,
  };

  useEffect(() => {
    if (soliState !== 'idle') {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(10, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [soliState]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (soliState === 'idle') return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: stateBg[soliState],
          borderColor: stateBorder[soliState],
        },
        animStyle,
      ]}
    >
      <SoliAvatar size={40} state={soliState} />
      <View style={styles.textWrap}>
        <Text style={[styles.name, { color: stateNameColor[soliState] }]}>Soli</Text>
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
