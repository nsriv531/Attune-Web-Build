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
import { SoliAvatar } from '@/components/SoliAvatar';
import { useOnboardingStore } from '@/stores/onboardingStore';
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
  const scale = useSharedValue(1);

  function handlePress() {
    scale.value = withSpring(0.95, { damping: 20 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.selectionAsync();
    onSelect();
  }

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} style={styles.cardPressable}>
      <Animated.View
        style={[
          styles.card,
          selected && styles.cardSelected,
          cardStyle,
        ]}
      >
        <SoliAvatar size={52} state="watching" />
        <View style={styles.cardText}>
          <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
            {item.label}
          </Text>
          <Text style={styles.cardHint}>{item.hint}</Text>
        </View>
      </Animated.View>
    </Pressable>
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
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing['2xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    flex: 1,
  },
  cardPressable: {
    width: '47%',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: 'rgba(167,139,250,0.6)',
    backgroundColor: Colors.purpleDim,
  },
  cardText: {
    alignItems: 'center',
    gap: 2,
  },
  cardLabel: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
  },
  cardLabelSelected: {
    color: Colors.purple,
  },
  cardHint: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  ctaWrap: {
    paddingVertical: Spacing['2xl'],
  },
});
