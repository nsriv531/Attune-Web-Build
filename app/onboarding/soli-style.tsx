import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
import { KeycapButton } from '@/components/KeycapSurface';
import { useOnboardingStore, type CoachingStyle } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const STYLES: { key: CoachingStyle; label: string; description: string }[] = [
  {
    key: 'gentle',
    label: 'Gentle',
    description: 'Soft nudges. Soli waits before stepping in.',
  },
  {
    key: 'steady',
    label: 'Steady',
    description: 'Balanced. Soli checks in at the right moments.',
  },
  {
    key: 'direct',
    label: 'Direct',
    description: "Honest. Soli tells you when you're slipping.",
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
      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
          {item.label}
        </Text>
        {selected && <View style={styles.dot} />}
      </View>
      <Text style={[styles.cardDesc, selected && styles.cardDescSelected]}>{item.description}</Text>
    </KeycapButton>
  );
}

export default function SoliStyleScreen() {
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
        <Text style={styles.headline}>How should Soli coach you?</Text>

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
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cardLabelSelected: {
    color: '#2C2000',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2000',
  },
  cardDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  cardDescSelected: {
    color: 'rgba(44,32,0,0.65)',
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
