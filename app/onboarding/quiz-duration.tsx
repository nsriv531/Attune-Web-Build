import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingLayout, CTAButton } from '@/components/OnboardingLayout';
import { useOnboardingStore, type OnboardingDuration } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const DURATIONS: { key: OnboardingDuration; label: string; desc: string }[] = [
  { key: 15, label: '15 min', desc: 'Quick sprint'   },
  { key: 25, label: '25 min', desc: 'Pomodoro'       },
  { key: 50, label: '50 min', desc: 'Deep block'     },
];

function DurationChip({
  item,
  selected,
  onSelect,
}: {
  item: typeof DURATIONS[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);

  function handlePress() {
    scale.value = withSpring(0.94, { damping: 20 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.selectionAsync();
    onSelect();
  }

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} style={styles.chipPressable}>
      <Animated.View style={[styles.chip, selected && styles.chipSelected, chipStyle]}>
        <Text style={[styles.chipTime, selected && styles.chipTimeSelected]}>{item.label}</Text>
        <Text style={styles.chipDesc}>{item.desc}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function QuizDurationScreen() {
  const router = useRouter();
  const { sessionDuration, setSessionDuration } = useOnboardingStore();
  const [selected, setSelected] = useState<OnboardingDuration>(sessionDuration);

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(12);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    contentY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  function handleNext() {
    setSessionDuration(selected);
    router.push('/onboarding/sage-learning' as never);
  }

  return (
    <OnboardingLayout step={9}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>How long can you focus right now?</Text>
        <Text style={styles.hint}>This sets up your first session with Sage.</Text>

        <View style={styles.chips}>
          {DURATIONS.map((d) => (
            <DurationChip
              key={d.key}
              item={d}
              selected={selected === d.key}
              onSelect={() => setSelected(d.key)}
            />
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton label="Next" onPress={handleNext} />
        </View>
      </Animated.View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  headline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 34,
  },
  hint: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing['2xl'],
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.md,
    flex: 1,
    alignItems: 'flex-start',
  },
  chipPressable: {
    flex: 1,
  },
  chip: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chipSelected: {
    borderColor: 'rgba(167,139,250,0.6)',
    backgroundColor: Colors.purpleDim,
  },
  chipTime: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
  },
  chipTimeSelected: {
    color: Colors.purple,
  },
  chipDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
