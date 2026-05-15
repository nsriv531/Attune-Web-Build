import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const TOTAL_STEPS = 17;

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  showBack?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  contentStyle?: ViewStyle;
}

export function OnboardingLayout({
  children,
  step,
  showBack = true,
  showSkip = false,
  onSkip,
  contentStyle,
}: OnboardingLayoutProps) {
  const router = useRouter();
  const progress = useSharedValue((step - 1) / TOTAL_STEPS);

  useEffect(() => {
    progress.value = withTiming(step / TOTAL_STEPS, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [step]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress track */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, barStyle]} />
      </View>

      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.navBtn} hitSlop={16}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.navBtn} />
        )}

        {showSkip && onSkip ? (
          <Pressable onPress={onSkip} style={styles.navBtn} hitSlop={16}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.navBtn} />
        )}
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

interface CTAButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'accent' | 'secondary';
}

export function CTAButton({ label, onPress, disabled = false, variant = 'accent' }: CTAButtonProps) {
  const pressAnim = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressAnim.value }],
  }));

  function handlePressIn() {
    if (!disabled) pressAnim.value = withTiming(3, { duration: 80 });
  }

  function handlePressOut() {
    pressAnim.value = withSpring(0, { damping: 12, stiffness: 300 });
  }

  const isAccent = variant === 'accent' && !disabled;
  const depthColor = isAccent ? Colors.keycapAccentDepthColor : Colors.keycapDepthColor;
  const faceColor = isAccent ? Colors.amber : Colors.bgCardHigh;
  const highlight = isAccent ? Colors.keycapAccentHighlight : Colors.keycapHighlight;
  const borderColor = isAccent ? Colors.amberBorder : Colors.border;
  const textColor = isAccent ? '#2C2000' : Colors.textTertiary;

  return (
    <View
      style={[
        styles.ctaDepth,
        {
          backgroundColor: depthColor,
          borderColor,
        },
        Platform.OS === 'ios'
          ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 10 }
          : { elevation: 3 },
      ]}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.ctaPressable}
        android_ripple={null}
      >
        <Animated.View
          style={[
            styles.ctaFace,
            { backgroundColor: faceColor },
            animStyle,
          ]}
        >
          {/* Top shine */}
          <View
            style={[styles.ctaShine, { backgroundColor: highlight }]}
            pointerEvents="none"
          />
          <Text style={[styles.ctaText, { color: textColor }]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  progressTrack: {
    height: 2,
    backgroundColor: Colors.border,
    width: '100%',
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.purple,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  navBtn: {
    width: 44,
    height: 36,
    justifyContent: 'center',
  },
  backArrow: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xl,
    color: Colors.textSecondary,
  },
  skipText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },

  // Keycap CTA button
  ctaDepth: {
    width: '100%',
    borderRadius: Radius.lg + 2,
    borderWidth: 1,
    paddingBottom: 3,
  },
  ctaPressable: {
    borderRadius: Radius.lg + 1,
  },
  ctaFace: {
    borderRadius: Radius.lg + 1,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ctaShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: Radius.lg + 1,
    borderTopRightRadius: Radius.lg + 1,
    zIndex: 1,
  },
  ctaText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
});
