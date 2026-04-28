import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout, CTAButton } from '@/components/OnboardingLayout';
import { Colors, Typography, Spacing } from '@/constants/theme';

function ParticleDot({ x, y, delay }: { x: string; y: string; delay: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(-12, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: x, top: y } as any,
        style,
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(16);
  const subOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    titleY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
    subOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    ctaOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <OnboardingLayout step={1} showBack={false} showSkip onSkip={() => router.replace('/(tabs)' as never)}>
      <View style={styles.container}>
        {/* Ambient particle drift */}
        <View style={styles.particles} pointerEvents="none">
          <ParticleDot x="18%" y="22%" delay={0} />
          <ParticleDot x="72%" y="15%" delay={600} />
          <ParticleDot x="55%" y="38%" delay={300} />
          <ParticleDot x="28%" y="55%" delay={900} />
          <ParticleDot x="80%" y="48%" delay={150} />
          <ParticleDot x="40%" y="70%" delay={750} />
          <ParticleDot x="12%" y="75%" delay={450} />
          <ParticleDot x="88%" y="72%" delay={1050} />
        </View>

        {/* Glow behind text */}
        <View style={styles.glow} pointerEvents="none" />

        <View style={styles.copy}>
          <Animated.Text style={[styles.headline, titleStyle]}>
            Focus that learns you back.
          </Animated.Text>
          <Animated.Text style={[styles.subline, subStyle]}>
            Meet Sage, your focus companion.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.ctaWrap, ctaStyle]}>
          <CTAButton label="Begin" onPress={() => router.push('/onboarding/sage-reveal' as never)} />
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  particles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.purple,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.purpleDim,
    alignSelf: 'center',
    top: '25%',
    opacity: 0.5,
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  headline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  subline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ctaWrap: {
    position: 'absolute',
    bottom: Spacing['2xl'],
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
  },
});
