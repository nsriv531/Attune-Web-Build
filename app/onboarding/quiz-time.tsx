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
import { useOnboardingStore, type TimeOfDay } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const TIMES: { key: TimeOfDay; label: string; range: string }[] = [
  { key: 'morning',    label: 'Morning',    range: '6am – 12pm' },
  { key: 'afternoon',  label: 'Afternoon',  range: '12pm – 5pm' },
  { key: 'evening',    label: 'Evening',    range: '5pm – 9pm'  },
  { key: 'late-night', label: 'Late night', range: '9pm – 2am'  },
];

function TimeCard({
  item,
  selected,
  onSelect,
}: {
  item: typeof TIMES[0];
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
      <View style={styles.cardRight}>
        <Text style={[styles.cardRange, selected && styles.cardRangeSelected]}>{item.range}</Text>
        {selected && <View style={styles.activeDot} />}
      </View>
    </KeycapButton>
  );
}

export default function QuizTimeScreen() {
  const router = useRouter();
  const { timeOfDay, setTimeOfDay } = useOnboardingStore();
  const [selected, setSelected] = useState<TimeOfDay | null>(timeOfDay);

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
    setTimeOfDay(selected);
    router.push('/onboarding/quiz-distraction' as never);
  }

  return (
    <OnboardingLayout step={6}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>When does your brain show up?</Text>

        <View style={styles.list}>
          {TIMES.map((t) => (
            <TimeCard
              key={t.key}
              item={t}
              selected={selected === t.key}
              onSelect={() => setSelected(t.key)}
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
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardRange: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    letterSpacing: 0.4,
  },
  cardRangeSelected: {
    color: 'rgba(44,32,0,0.50)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2000',
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
