import React, { useEffect, useState } from 'react';
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

export default function SageRevealScreen() {
  const router = useRouter();
  const { soliForm } = useOnboardingStore();
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const soliScale = useSharedValue(0.5);
  const soliOpacity = useSharedValue(0);
  const line1Opacity = useSharedValue(0);
  const line2Opacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    soliScale.value = withSpring(1, { damping: 14, stiffness: 160 });
    soliOpacity.value = withTiming(1, { duration: 800 });

    const t1 = setTimeout(() => {
      line1Opacity.value = withTiming(1, { duration: 600 });
    }, 400);

    const t2 = setTimeout(() => {
      setShowSecondLine(true);
      line2Opacity.value = withTiming(1, { duration: 600 });
    }, 1800);

    const t3 = setTimeout(() => {
      setShowCTA(true);
      ctaOpacity.value = withTiming(1, { duration: 400 });
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const soliStyle = useAnimatedStyle(() => ({
    transform: [{ scale: soliScale.value }],
    opacity: soliOpacity.value,
  }));
  const line1Style = useAnimatedStyle(() => ({ opacity: line1Opacity.value }));
  const line2Style = useAnimatedStyle(() => ({ opacity: line2Opacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <OnboardingLayout step={2} showBack={false} showSkip onSkip={() => router.replace('/(tabs)' as never)}>
      <View style={styles.container}>
        <View style={styles.glow} pointerEvents="none" />

        <Animated.View style={[styles.avatarWrap, soliStyle]}>
          <SoliAvatar size={96} state="watching" />
        </Animated.View>

        <View style={styles.copy}>
          <Animated.Text style={[styles.line1, line1Style]}>
            This is Soli.
          </Animated.Text>

          {showSecondLine && (
            <Animated.Text style={[styles.line2, line2Style]}>
              Soli watches your focus sessions and learns what helps you stay sharp.
            </Animated.Text>
          )}
        </View>

        {showCTA && (
          <Animated.View style={[styles.ctaWrap, ctaStyle]}>
            <CTAButton
              label="Continue"
              onPress={() => router.push('/onboarding/soli-form' as never)}
            />
          </Animated.View>
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.purpleDim,
    opacity: 0.6,
  },
  avatarWrap: {
    marginBottom: Spacing['2xl'],
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  line1: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  line2: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  ctaWrap: {
    position: 'absolute',
    bottom: Spacing['2xl'],
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
  },
});
