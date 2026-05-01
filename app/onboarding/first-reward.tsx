import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CTAButton } from '@/components/OnboardingLayout';
import { SoliAvatar } from '@/components/SoliAvatar';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useUserStore } from '@/stores/userStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const SOLI_MESSAGES: Record<string, string> = {
  gentle: 'That was a good start. I noticed you stayed with it.',
  steady: 'Solid first session. Tomorrow, we go deeper.',
  direct: 'One down. Same time tomorrow.',
};

function RewardCard({
  value,
  label,
  color,
  delay,
}: {
  value: string | number;
  label: string;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 180 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.rewardCard, style]}>
      <Text style={[styles.rewardNum, { color }]}>{value}</Text>
      <Text style={[styles.rewardLabel, { color: `${color}99` }]}>{label}</Text>
    </Animated.View>
  );
}

export default function FirstRewardScreen() {
  const router = useRouter();
  const { soliForm, coachingStyle } = useOnboardingStore();
  const { addXP, incrementStreak } = useUserStore();

  const soliScale = useSharedValue(0.5);
  const soliOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(12);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    soliScale.value = withSpring(1, { damping: 12, stiffness: 160 });
    soliOpacity.value = withTiming(1, { duration: 400 });
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    titleY.value = withDelay(200, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    addXP(10);
    incrementStreak();
  }, []);

  const soliStyle = useAnimatedStyle(() => ({
    transform: [{ scale: soliScale.value }],
    opacity: soliOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const message = SOLI_MESSAGES[coachingStyle] ?? SOLI_MESSAGES.steady;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.container}>
        <Animated.View style={soliStyle}>
          <SoliAvatar size={80} state="celebrate" />
        </Animated.View>

        <Animated.View style={[styles.titleWrap, titleStyle]}>
          <Text style={styles.title}>First session complete.</Text>
          <Text style={styles.subtitle}>You did the hardest part.</Text>
        </Animated.View>

        <View style={styles.rewardRow}>
          <RewardCard value="+10" label="XP" color={Colors.purple} delay={300} />
          <RewardCard value="1" label="Streak" color={Colors.amber} delay={450} />
          <RewardCard value="100" label="Focus" color={Colors.green} delay={600} />
        </View>

        <View style={styles.sageCard}>
          <View style={styles.sageCardTop}>
            <SoliAvatar size={28} state="watching" />
            <Text style={styles.sageName}>Soli</Text>
          </View>
          <Text style={styles.sageMsg}>{message}</Text>
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton
            label="Continue"
            onPress={() => router.push('/onboarding/reflection' as never)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgSession,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.purpleDim,
    top: '15%',
    alignSelf: 'center',
    opacity: 0.5,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    gap: Spacing.xl,
  },
  titleWrap: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rewardCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minWidth: 90,
  },
  rewardNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
  },
  rewardLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  sageCard: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  sageCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sageName: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.purple,
    letterSpacing: 0.5,
  },
  sageMsg: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaWrap: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: Spacing['2xl'],
  },
});
