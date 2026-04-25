// components/SageOverlay.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useEffect as useReanimatedEffect,
} from 'react-native-reanimated';
import { SageAvatar } from './SageAvatar';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

type SageState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';

interface SageOverlayProps {
  sageState: SageState;
  message: string;
  onDismiss?: () => void;
}

const STATE_BG: Record<SageState, string> = {
  idle:      Colors.bgCard,
  watching:  Colors.bgCard,
  nudge:     'rgba(251,191,36,0.08)',
  alert:     'rgba(248,113,113,0.08)',
  celebrate: 'rgba(74,222,128,0.08)',
};

const STATE_BORDER: Record<SageState, string> = {
  idle:      Colors.border,
  watching:  Colors.border,
  nudge:     'rgba(251,191,36,0.25)',
  alert:     'rgba(248,113,113,0.3)',
  celebrate: 'rgba(74,222,128,0.3)',
};

const STATE_NAME_COLOR: Record<SageState, string> = {
  idle:      Colors.purple,
  watching:  Colors.purple,
  nudge:     Colors.amber,
  alert:     '#f87171',
  celebrate: Colors.green,
};

export function SageOverlay({ sageState, message, onDismiss }: SageOverlayProps) {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useReanimatedEffect(() => {
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
          backgroundColor: STATE_BG[sageState],
          borderColor: STATE_BORDER[sageState],
        },
        animStyle,
      ]}
    >
      <SageAvatar size={40} state={sageState} />
      <View style={styles.textWrap}>
        <Text style={[styles.name, { color: STATE_NAME_COLOR[sageState] }]}>Sage</Text>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={styles.dismiss}>✕</Text>
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
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dismiss: {
    fontSize: 12,
    color: Colors.textTertiary,
    paddingLeft: 4,
  },
});
