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

const DISTRACTIONS = [
  'My phone keeps calling me',
  'Social media rabbit holes',
  'Noise and environment',
  'My own thoughts',
];

function DistractionCard({
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
    scale.value = withSpring(0.97, { damping: 20 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.selectionAsync();
    onToggle();
  }

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.card, selected && styles.cardSelected, cardStyle]}>
        <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{label}</Text>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <View style={styles.checkDot} />}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function QuizDistractionScreen() {
  const router = useRouter();
  const { distractions, setDistractions } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(distractions);

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
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  }

  function handleNext() {
    setDistractions(selected);
    router.push('/onboarding/quiz-goal' as never);
  }

  return (
    <OnboardingLayout step={7}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>What pulls you off track?</Text>
        <Text style={styles.hint}>Sage will watch for these specifically.</Text>

        <View style={styles.list}>
          {DISTRACTIONS.map((d) => (
            <DistractionCard
              key={d}
              label={d}
              selected={selected.includes(d)}
              onToggle={() => toggle(d)}
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
    flex: 1,
    paddingRight: Spacing.sm,
  },
  cardLabelSelected: {
    color: Colors.textPrimary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: Colors.purple,
    backgroundColor: Colors.purple,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
