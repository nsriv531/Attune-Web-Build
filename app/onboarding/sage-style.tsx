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
import { useOnboardingStore, type CoachingStyle } from '@/backend/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const STYLES: { key: CoachingStyle; label: string; description: string }[] = [
  {
    key: 'gentle',
    label: 'Gentle',
    description: 'Soft nudges. Sage waits before stepping in.',
  },
  {
    key: 'steady',
    label: 'Steady',
    description: 'Balanced. Sage checks in at the right moments.',
  },
  {
    key: 'direct',
    label: 'Direct',
    description: "Honest. Sage tells you when you're slipping.",
  },
];

function StyleCard({
  item,
  selected,
  onSelect,
}: {
  item: typeof STYLES[0];
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
        <View style={styles.cardRow}>
          <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
            {item.label}
          </Text>
          {selected && <View style={styles.dot} />}
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function SageStyleScreen() {
  const router = useRouter();
  const { coachingStyle, setCoachingStyle } = useOnboardingStore();
  const [selected, setSelected] = useState<CoachingStyle>(coachingStyle);

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
    setCoachingStyle(selected);
    router.push('/onboarding/quiz-subject' as never);
  }

  return (
    <OnboardingLayout step={4}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>How should Sage coach you?</Text>

        <View style={styles.list}>
          {STYLES.map((s) => (
            <StyleCard
              key={s.key}
              item={s}
              selected={selected === s.key}
              onSelect={() => setSelected(s.key)}
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
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  cardSelected: {
    borderColor: 'rgba(167,139,250,0.6)',
    backgroundColor: Colors.purpleDim,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
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
  cardDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
