import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { SoliAvatar } from '@/components/Mascots';
import { SageAvatar } from '@/components/SageAvatar';
import { useOnboardingStore } from '@/backend/stores/onboardingStore';
import { Colors, Typography, Spacing } from '@/constants/theme';

const LINES = [
  "Reading your distraction profile...",
  "Calibrating session length...",
  "Tuning Soli's coaching style...",
];

function FadeLine({ text, delay }: { text: string; delay: number }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text style={[styles.line, style]}>{text}</Animated.Text>
  );
}

export default function SageLearningScreen() {
  const router = useRouter();
  const { soliForm } = useOnboardingStore();

  const breathScale = useSharedValue(1);

  useEffect(() => {
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    const t = setTimeout(() => {
      router.push('/onboarding/soli-plan' as never);
    }, 3800);

    return () => clearTimeout(t);
  }, []);

  const sageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  return (
    <OnboardingLayout step={10} showBack={false}>
      <View style={styles.container}>
        <View style={styles.glow} pointerEvents="none" />

        <Animated.View style={sageStyle}>
          <SoliAvatar size={88} state="watching" />
        </Animated.View>

        <View style={styles.lines}>
          {LINES.map((l, i) => (
            <FadeLine key={l} text={l} delay={i * 900 + 300} />
          ))}
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
    opacity: 0.7,
  },
  lines: {
    gap: Spacing.base,
    alignItems: 'center',
  },
  line: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
