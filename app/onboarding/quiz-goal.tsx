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
import { useOnboardingStore, type GoalType } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const GOALS: { key: GoalType; label: string }[] = [
  { key: 'deep-work',       label: 'Deep work'        },
  { key: 'daily-homework',  label: 'Daily homework'   },
  { key: 'exam-prep',       label: 'Exam prep'        },
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
  const scale = useSharedValue(1);

  function handlePress() {
    scale.value = withSpring(0.97, { damping: 20 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.selectionAsync();
    onSelect();
  }

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.card, selected && styles.cardSelected, cardStyle]}>
        <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
          {item.label}
        </Text>
        {selected && <View style={styles.dot} />}
      </Animated.View>
    </Pressable>
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
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing['2xl'],
    lineHeight: 34,
  },
  list: {
    flex: 1,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: 'rgba(167,139,250,0.6)',
    backgroundColor: Colors.purpleDim,
  },
  cardLabel: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
  },
  cardLabelSelected: {
    color: Colors.purple,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.purple,
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
