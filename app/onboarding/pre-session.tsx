import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout, CTAButton } from '@/components/OnboardingLayout';
import { SoliAvatar } from '@/components/Mascots';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function PreSessionScreen() {
  const router = useRouter();
  const { soliForm } = useOnboardingStore();

  const avatarScale = useSharedValue(0.8);
  const avatarOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);

  useEffect(() => {
    avatarScale.value = withSpring(1, { damping: 14, stiffness: 160 });
    avatarOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    contentY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    opacity: avatarOpacity.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <OnboardingLayout step={13}>
      <View style={styles.container}>
        <View style={styles.glow} pointerEvents="none" />

        <Animated.View style={avatarStyle}>
          <SoliAvatar size={80} state="watching" />
        </Animated.View>

        <Animated.View style={[styles.copy, contentStyle]}>
          <Text style={styles.headline}>Your first session, with Soli watching.</Text>
          <Text style={styles.subline}>
            Sixty seconds. We'll show you how it works.
          </Text>
          <Text style={styles.note}>
            Soli will respond in real time. Just focus.
          </Text>
        </Animated.View>

        <View style={styles.ctaWrap}>
          <CTAButton
            label="Begin session"
            onPress={() => router.push('/onboarding/micro-session' as never)}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2xl'],
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.purpleDim,
    opacity: 0.5,
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.sm,
  },
  headline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  subline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  note: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  ctaWrap: {
    position: 'absolute',
    bottom: Spacing['2xl'],
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
  },
});
