import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout, CTAButton } from '@/components/OnboardingLayout';
import { KeycapSurface } from '@/components/KeycapSurface';
import { SoliAvatar } from '@/components/SoliAvatar';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const TIME_LABELS: Record<string, string> = {
  morning:    'Morning',
  afternoon:  'Afternoon',
  evening:    'Evening',
  'late-night': 'Late night',
};

function PlanRow({ icon, label, value, delay }: { icon: string; label: string; value: string; delay: number }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(8);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    y.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View style={[styles.planRow, style]}>
      <Text style={styles.planIcon}>{icon}</Text>
      <View style={styles.planText}>
        <Text style={styles.planLabel}>{label}</Text>
        <Text style={styles.planValue}>{value}</Text>
      </View>
    </Animated.View>
  );
}

export default function SagePlanScreen() {
  const router = useRouter();
  const { subjects, timeOfDay, distractions, sessionDuration, soliForm, coachingStyle } =
    useOnboardingStore();

  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.94);

  useEffect(() => {
    cardOpacity.value = withSpring(1, { damping: 14, stiffness: 160 });
    cardScale.value = withSpring(1, { damping: 14, stiffness: 160 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const topSubject = subjects[0] ?? 'your first subject';
  const timeLabel = timeOfDay ? TIME_LABELS[timeOfDay] : 'Your best time';
  const top2 = distractions.slice(0, 2);
  const watchFor = top2.length > 0 ? top2.join(' · ') : 'Distraction patterns';

  return (
    <OnboardingLayout step={11}>
      <View style={styles.container}>
        <View style={styles.header}>
          <SoliAvatar size={44} state="watching" />
          <View style={styles.headerText}>
            <Text style={styles.sageName}>Soli</Text>
            <Text style={styles.headline}>Soli has a plan for you.</Text>
          </View>
        </View>

        <Animated.View style={cardStyle}>
          <KeycapSurface radius={Radius.xl} contentStyle={styles.planCardFace}>
            <PlanRow
              icon="⏱"
              label="Starter session"
              value={`${sessionDuration} min · ${topSubject}`}
              delay={100}
            />
            <View style={styles.divider} />
            <PlanRow
              icon="☀"
              label="Best time"
              value={timeLabel}
              delay={250}
            />
            <View style={styles.divider} />
            <PlanRow
              icon="👁"
              label="Soli will watch for"
              value={watchFor}
              delay={400}
            />
          </KeycapSurface>
        </Animated.View>

        <View style={styles.ctaWrap}>
          <CTAButton
            label="Looks right"
            onPress={() => router.push('/onboarding/permissions' as never)}
          />
          <Pressable
            style={styles.adjustBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.adjustText}>Adjust</Text>
          </Pressable>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    gap: 2,
  },
  sageName: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.purple,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  planCardFace: {
    paddingVertical: Spacing.sm,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  planIcon: {
    fontSize: 20,
    width: 28,
  },
  planText: {
    flex: 1,
    gap: 2,
  },
  planLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planValue: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
  },
  ctaWrap: {
    gap: Spacing.sm,
    marginTop: 'auto',
    paddingBottom: Spacing['2xl'],
  },
  adjustBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  adjustText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
});
