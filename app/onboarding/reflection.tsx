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
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const ENERGY_OPTIONS = ['Heavy', 'Okay', 'Sharp'];
const FOCUS_OPTIONS = ['Scattered', 'Mixed', 'Locked in'];
const WORD_OPTIONS = ['Calm', 'Restless', 'Productive', 'Slow', 'Surprising', 'Tough'];

function ChoiceChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
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
      radius={Radius.full}
      contentStyle={styles.chipFace}
      onPress={handlePress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </KeycapButton>
  );
}

interface ReflectionState {
  energy: string | null;
  focusQuality: string | null;
  word: string | null;
}

export default function ReflectionScreen() {
  const router = useRouter();
  const [reflection, setReflection] = useState<ReflectionState>({
    energy: null,
    focusQuality: null,
    word: null,
  });

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

  const allSelected = reflection.energy && reflection.focusQuality && reflection.word;

  function handleSave() {
    router.push('/onboarding/tomorrow' as never);
  }

  return (
    <OnboardingLayout step={16}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>How did that feel?</Text>

        <View style={styles.sections}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Energy</Text>
            <View style={styles.chipRow}>
              {ENERGY_OPTIONS.map((e) => (
                <ChoiceChip
                  key={e}
                  label={e}
                  selected={reflection.energy === e}
                  onSelect={() => setReflection((r) => ({ ...r, energy: e }))}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Focus quality</Text>
            <View style={styles.chipRow}>
              {FOCUS_OPTIONS.map((f) => (
                <ChoiceChip
                  key={f}
                  label={f}
                  selected={reflection.focusQuality === f}
                  onSelect={() => setReflection((r) => ({ ...r, focusQuality: f }))}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>One word for the session</Text>
            <View style={styles.wordGrid}>
              {WORD_OPTIONS.map((w) => (
                <ChoiceChip
                  key={w}
                  label={w}
                  selected={reflection.word === w}
                  onSelect={() => setReflection((r) => ({ ...r, word: w }))}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton
            label="Save reflection"
            onPress={handleSave}
            disabled={!allSelected}
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
    marginBottom: Spacing['2xl'],
  },
  sections: {
    flex: 1,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chipFace: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  chipText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#2C2000',
    fontWeight: '700',
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
