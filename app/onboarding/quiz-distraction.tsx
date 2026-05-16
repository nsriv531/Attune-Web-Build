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
import { useOnboardingStore } from '@/backend/stores/onboardingStore';
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
  function handlePress() {
    Haptics.selectionAsync();
    onToggle();
  }

  return (
    <KeycapButton
      accent={selected}
      radius={Radius.xl}
      contentStyle={styles.cardFace}
      onPress={handlePress}
    >
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{label}</Text>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <View style={styles.checkDot} />}
      </View>
    </KeycapButton>
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
        <Text style={styles.hint}>Soli will watch for these specifically.</Text>

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
    flex: 1,
    paddingRight: Spacing.sm,
  },
  cardLabelSelected: {
    color: '#2C2000',
    fontWeight: '700',
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
    borderColor: '#2C2000',
    backgroundColor: '#2C2000',
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amber,
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
