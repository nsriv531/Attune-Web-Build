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
  function handlePress() {
    Haptics.selectionAsync();
    onSelect();
  }

  return (
    <KeycapButton
      accent={selected}
      radius={Radius.xl}
      style={styles.chipPressable}
      contentStyle={styles.chipFace}
      onPress={handlePress}
    >
      <Text style={[styles.chipTime, selected && styles.chipTimeSelected]}>{item.label}</Text>
      <Text style={[styles.chipDesc, selected && styles.chipDescSelected]}>{item.desc}</Text>
    </KeycapButton>
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
    router.push('/onboarding/soli-learning' as never);
  }

  return (
    <OnboardingLayout step={9}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>How long can you focus right now?</Text>
        <Text style={styles.hint}>This sets up your first session with Soli.</Text>

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
    fontWeight: '700',
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
  chipFace: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chipTime: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTimeSelected: {
    color: '#2C2000',
    fontWeight: '800',
  },
  chipDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  chipDescSelected: {
    color: 'rgba(44,32,0,0.60)',
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
