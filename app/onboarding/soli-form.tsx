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
import { SoliAvatar } from '@/components/Mascots';
import { SageAvatar } from '@/components/SageAvatar';
import { useOnboardingStore} from '@/backend/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const VIBES: { key: string; label: string; hint: string }[] = [
  { key: 'focus',   label: 'Deep Focus',   hint: 'Warmth' },
  { key: 'calm',    label: 'Calm Study',   hint: 'Serene' },
  { key: 'energy',  label: 'High Energy',  hint: 'Radiant' },
  { key: 'steady',  label: 'Steady Flow',  hint: 'Constant' },
];

function FormCard({
  item,
  selected,
  onSelect,
}: {
  item: typeof VIBES[0];
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
      style={styles.cardOuter}
      contentStyle={styles.cardFace}
      onPress={handlePress}
    >
      <SoliAvatar size={52} state="watching" />
      <View style={styles.cardText}>
        <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
          {item.label}
        </Text>
        <Text style={[styles.cardHint, selected && styles.cardHintSelected]}>{item.hint}</Text>
      </View>
    </KeycapButton>
  );
}

export default function SageFormScreen() {
  const router = useRouter();
  const { soliForm, setSoliForm } = useOnboardingStore();
  const [selected, setSelected] = useState<string>(soliForm);

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
    setSoliForm(selected);
    router.push('/onboarding/soli-style' as never);
  }

  return (
    <OnboardingLayout step={3}>
      <Animated.View style={[styles.container, contentStyle]}>
        <Text style={styles.headline}>Meet Soli.</Text>

        <View style={styles.grid}>
          {VIBES.map((v) => (
            <FormCard
              key={v.key}
              item={v}
              selected={selected === v.key}
              onSelect={() => setSelected(v.key as any)}
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    flex: 1,
  },
  cardOuter: {
    width: '47%',
  },
  cardFace: {
    alignItems: 'center',
    gap: Spacing.sm,
    aspectRatio: 1,
    justifyContent: 'center',
    padding: Spacing.base,
  },
  cardText: {
    alignItems: 'center',
    gap: 2,
  },
  cardLabel: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: '#2C2000',
    fontWeight: '700',
  },
  cardHint: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  cardHintSelected: {
    color: 'rgba(44,32,0,0.50)',
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
