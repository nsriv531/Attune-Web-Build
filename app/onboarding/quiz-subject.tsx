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
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const SUBJECTS = ['Math', 'Writing', 'CS', 'Languages', 'Science', 'Other'];

function SubjectCard({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);

  function handlePress() {
    scale.value = withSpring(0.94, { damping: 20 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.selectionAsync();
    onToggle();
  }

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} style={styles.cardPressable}>
      <Animated.View style={[styles.card, selected && styles.cardSelected, cardStyle]}>
        <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function QuizSubjectScreen() {
  const router = useRouter();
  const { subjects, setSubjects } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(subjects);

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

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  }

  function handleNext() {
    setSubjects(selected);
    router.push('/onboarding/quiz-time' as never);
  }

  return (
    <OnboardingLayout step={5}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>What are you focusing on?</Text>
        <Text style={styles.hint}>Select all that apply.</Text>

        <View style={styles.grid}>
          {SUBJECTS.map((s) => (
            <SubjectCard
              key={s}
              label={s}
              selected={selected.includes(s)}
              onToggle={() => toggle(s)}
            />
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton
            label="Next"
            onPress={handleNext}
            disabled={selected.length === 0}
          />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    flex: 1,
  },
  cardPressable: {
    width: '31%',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: 'rgba(167,139,250,0.6)',
    backgroundColor: Colors.purpleDim,
  },
  cardLabel: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  cardLabelSelected: {
    color: Colors.purple,
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
