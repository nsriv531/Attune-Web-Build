import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingLayout, CTAButton } from '@/components/OnboardingLayout';
import { KeycapButton } from '@/components/KeycapSurface';

import { useOnboardingStore, type GoalType } from '@/backend/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const GOALS: { key: GoalType; label: string }[] = [
  { key: 'deep-work',       label: 'Deep work'          },
  { key: 'daily-homework',  label: 'Daily homework'     },
  { key: 'exam-prep',       label: 'Exam prep'          },
  { key: 'building-habit',  label: 'Building the habit' },
];

function GoalCard({
  item,
  selected,
  onSelect,
}: {
  item: typeof GOALS[0];
  selected: boolean;
  onSelect: () => void;
}) {
  function handlePress() {
    Haptics.selectionAsync();
    onSelect();
  }

  return (
    <KeycapButton
      accent={selected}
      radius={Radius.xl}
      contentStyle={styles.cardFace}
      onPress={handlePress}
    >
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
        {item.label}
      </Text>
      {selected && <View style={styles.dot} />}
    </KeycapButton>
  );
}

export default function QuizGoalScreen() {
  const router = useRouter();
  const { goal, setGoal } = useOnboardingStore();
  const [selected, setSelected] = useState<GoalType | null>(goal);

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
    if (!selected) return;
    setGoal(selected);
    router.push('/onboarding/quiz-duration' as never);
  }

  return (
    <OnboardingLayout step={8}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>What are you using Attune for?</Text>

        <View style={styles.list}>
          {GOALS.map((g) => (
            <GoalCard
              key={g.key}
              item={g}
              selected={selected === g.key}
              onSelect={() => setSelected(g.key)}
            />
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton label="Next" onPress={handleNext} disabled={!selected} />
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
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing['2xl'],
    lineHeight: 34,
  },
  list: {
    flex: 1,
    gap: Spacing.md,
  },
  cardFace: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  cardLabelSelected: {
    color: '#2C2000',
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2000',
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
