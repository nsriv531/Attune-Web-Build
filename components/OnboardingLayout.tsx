import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
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
}

export function CTAButton({ label, onPress, disabled = false }: CTAButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.cta, disabled && styles.ctaDisabled]}
    >
      <Text style={[styles.ctaText, disabled && styles.ctaTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgSession,
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

  cta: {
    width: '100%',
    backgroundColor: Colors.purple,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  ctaDisabled: {
    backgroundColor: Colors.bgInput,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  ctaText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: '#fff',
  },
  ctaTextDisabled: {
    color: Colors.textTertiary,
  },
});
