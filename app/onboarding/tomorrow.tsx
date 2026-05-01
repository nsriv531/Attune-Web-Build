import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SoliAvatar } from '@/components/SoliAvatar';
import { CTAButton } from '@/components/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { SessionDuration } from '@/types';

const TIME_LABELS: Record<string, string> = {
  morning:    '8:00 am',
  afternoon:  '2:00 pm',
  evening:    '7:00 pm',
  'late-night': '10:00 pm',
};

const DURATION_MAP: Record<number, SessionDuration> = {
  15: 25,
  25: 25,
  50: 45,
};

const RATIONALE: Record<string, Record<string, string>> = {
  gentle: {
    morning:    'You mentioned mornings work best. Let\'s start gentle and build momentum.',
    afternoon:  'Afternoons seem to be your window. A calm, steady session is a good fit.',
    evening:    'Evening sessions can be grounding. Sage will stay close.',
    'late-night': 'Night owl energy noted. Keep it focused and wrap up before midnight.',
  },
  steady: {
    morning:    'Mornings are your peak. Lock in and let Sage hold the frame.',
    afternoon:  'Afternoon block confirmed. Sage will be there with you.',
    evening:    'Evening looks right. Same time tomorrow — Sage will expect you.',
    'late-night': 'Late night focus is real. Keep the same rhythm and it compounds.',
  },
  direct: {
    morning:    'Morning. Your best window. Don\'t waste it.',
    afternoon:  'Afternoon is solid. Show up at the same time and Sage will be ready.',
    evening:    'Evening session locked. Same time tomorrow — no excuses.',
    'late-night': 'Late but committed. Sage will hold you to it.',
  },
};

function SuggestionRow({ icon, label, value, delay }: {
  icon: string;
  label: string;
  value: string;
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(6);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    y.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View style={[styles.row, style]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </Animated.View>
  );
}

export default function TomorrowScreen() {
  const router = useRouter();
  const { soliForm, coachingStyle, timeOfDay, sessionDuration, subjects, completeOnboarding } =
    useOnboardingStore();
  const { setSubject, setDuration } = useSessionStore();

  const sageScale = useSharedValue(0.8);
  const sageOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    sageScale.value = withSpring(1, { damping: 14, stiffness: 160 });
    sageOpacity.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, []);

  const sageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sageScale.value }],
    opacity: sageOpacity.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const timeKey = timeOfDay ?? 'evening';
  const suggestedTime = TIME_LABELS[timeKey];
  const suggestedDuration = DURATION_MAP[sessionDuration] ?? 25;
  const topSubject = subjects[0] ?? 'your first subject';
  const rationale = RATIONALE[coachingStyle]?.[timeKey] ?? '';

  async function handleStart() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubject(topSubject, 'onboarding-subject');
    setDuration(suggestedDuration);
    await completeOnboarding();
    router.replace('/(tabs)' as never);
  }

  async function handleLater() {
    setSubject(topSubject, 'onboarding-subject');
    setDuration(suggestedDuration);
    await completeOnboarding();
    router.replace('/(tabs)' as never);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Full-width progress bar at 100% */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFull} />
      </View>

      <View style={styles.container}>
        <Animated.View style={[styles.header, contentStyle]}>
          <Animated.View style={sageStyle}>
            <SoliAvatar size={52} state="watching" />
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={styles.tagline}>Sage learns from this.</Text>
            <Text style={styles.headline}>Here's tomorrow.</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, contentStyle]}>
          <SuggestionRow icon="⏱" label="Duration" value={`${suggestedDuration} min`} delay={200} />
          <View style={styles.divider} />
          <SuggestionRow icon="☀" label="Suggested time" value={suggestedTime} delay={350} />
          <View style={styles.divider} />
          <SuggestionRow icon="📚" label="Subject" value={topSubject} delay={500} />
        </Animated.View>

        <Animated.View style={[styles.rationaleCard, contentStyle]}>
          <View style={styles.rationaleHeader}>
            <SoliAvatar size={24} state="watching" />
            <Text style={styles.sageName}>Sage</Text>
          </View>
          <Text style={styles.rationaleText}>{rationale}</Text>
        </Animated.View>

        <View style={styles.ctaWrap}>
          <CTAButton label="Start tomorrow" onPress={handleStart} />
          <Pressable style={styles.laterBtn} onPress={handleLater}>
            <Text style={styles.laterText}>I'll decide later</Text>
          </Pressable>
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
  progressTrack: {
    height: 2,
    backgroundColor: Colors.border,
  },
  progressFull: {
    height: 2,
    width: '100%',
    backgroundColor: Colors.purple,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
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
  tagline: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.purple,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  rowIcon: {
    fontSize: 18,
    width: 26,
  },
  rowText: {
    gap: 2,
  },
  rowLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
  },
  rationaleCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  rationaleHeader: {
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
  rationaleText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaWrap: {
    marginTop: 'auto',
    paddingBottom: Spacing['2xl'],
    gap: Spacing.xs,
  },
  laterBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  laterText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
});
