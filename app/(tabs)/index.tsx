import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import TopAppBar from '@/components/TopAppBar';
import { TimerRing } from '@/components/TimerRing';

const DURATIONS: number[] = [15, 18, 25, 45];

export default function HomeScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const { name, streakDays } = useUserStore();
  const { durationMinutes, setDuration, startSession } = useSessionStore();

  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [customDuration, setCustomDuration] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession();
    router.push('/(tabs)/session');
  }

  function handleDurationSelect(duration: number) {
    setDuration(duration);
    Haptics.selectionAsync();
  }

  // Animation for today's focus column
  const highlightScale = useSharedValue(1);
  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: highlightScale.value }],
  }));

  useEffect(() => {
    highlightScale.value = withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TopAppBar */}
        <TopAppBar userName={name} />

        {/* ── Greeting Section ── */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: C.textPrimary }]}>
            {greeting}, {name}
          </Text>
          <Text style={[styles.greetingSubtitle, { color: C.textSecondary }]}>
            The light is perfect for deep work today.
          </Text>
        </View>

        {/* ── Focus Hero Section ── */}
        <View style={styles.heroSection}>
          {/* Circular Timer Ring */}
          <View style={styles.timerContainer}>
            <TimerRing secondsRemaining={durationMinutes * 60} totalSeconds={durationMinutes * 60} />
          </View>

          {/* Mascot placeholder */}
          <View
            style={[
              styles.mascot,
              {
                backgroundColor: `${C.purple}15`,
                borderColor: C.border,
              },
            ]}
          >
            <Text style={[styles.mascotEmoji, { color: C.textTertiary }]}>🌱</Text>
          </View>

          {/* Start CTA */}
          <Pressable
            style={[styles.startBtn, { backgroundColor: C.amber }]}
            onPress={handleStart}
          >
            <Text style={styles.startBtnText}>Start Focus Session</Text>
          </Pressable>

          {/* Duration Pills */}
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                style={[
                  styles.durationPill,
                  {
                    backgroundColor: durationMinutes === d ? `${C.purple}15` : C.bgCard,
                    borderColor: durationMinutes === d ? C.purple : C.border,
                  },
                ]}
                onPress={() => handleDurationSelect(d)}
              >
                <Text
                  style={[
                    styles.durationText,
                    {
                      color: durationMinutes === d ? C.purple : C.textTertiary,
                      fontWeight: durationMinutes === d ? '600' : '400',
                    },
                  ]}
                >
                  {d}
                </Text>
              </Pressable>
            ))}

            <Pressable
              style={[
                styles.durationPill,
                {
                  backgroundColor: C.bgCard,
                  borderColor: C.border,
                },
              ]}
              onPress={() => setShowDurationPicker(!showDurationPicker)}
            >
              <Text style={[styles.durationText, { color: C.textTertiary }]}>✏ Custom</Text>
            </Pressable>
          </View>
        </View>

        {/* Custom Duration Input */}
        {showDurationPicker && (
          <View style={styles.customDurationSection}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Enter minutes:</Text>
            <View style={styles.customInputRow}>
              <Pressable
                style={[styles.customBtn, { backgroundColor: C.bgCard }]}
                onPress={() => {
                  const val = parseInt(customDuration || '0');
                  if (val > 0) {
                    handleDurationSelect(val);
                    setShowDurationPicker(false);
                    setCustomDuration('');
                  }
                }}
              >
                <Text style={[styles.customBtnText, { color: C.textPrimary }]}>Set</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: C.bgCard,
                borderColor: C.border,
              },
            ]}
          >
            <View style={styles.statsCardHeader}>
              <Text style={[styles.statsLabel, { color: C.textTertiary }]}>TODAY</Text>
            </View>
            <Text style={[styles.statsValue, { color: C.textPrimary }]}>45</Text>
            <Text style={[styles.statsUnit, { color: C.textSecondary }]}>min</Text>
            <Text style={[styles.statsCaption, { color: C.textTertiary }]}>Focused time</Text>
          </View>

          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: C.bgCard,
                borderColor: C.border,
              },
            ]}
          >
            <View style={styles.statsCardHeader}>
              <Text style={[styles.statsLabel, { color: C.amber }]}>STREAK</Text>
            </View>
            <Text style={[styles.statsValue, { color: C.textPrimary }]}>{streakDays}</Text>
            <Text style={[styles.statsUnit, { color: C.textSecondary }]}>days</Text>
            <Text style={[styles.statsCaption, { color: C.textTertiary }]}>In flow state</Text>
          </View>
        </View>

        {/* ── Performance Mode Glass Card ── */}
        <View
          style={[
            styles.performanceCard,
            {
              backgroundColor: C.bgGlass,
              borderColor: `${C.purple}40`,
            },
          ]}
        >
          <View>
            <Text style={[styles.perfTitle, { color: C.textPrimary }]}>Performance Mode</Text>
            <Text style={[styles.perfSubtitle, { color: C.textSecondary }]}>
              Enhanced focus for critical milestones.
            </Text>
          </View>
          <Pressable
            style={[
              styles.perfButton,
              {
                backgroundColor: C.textPrimary,
              },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={{ fontSize: 20 }}>⚡</Text>
          </Pressable>
        </View>

        {/* ── Weekly Equilibrium Chart ── */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: C.bgCard,
              borderColor: C.border,
            },
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: C.textPrimary }]}>Weekly Equilibrium</Text>
            <Text style={[styles.moreIcon, { color: C.textTertiary }]}>⋯</Text>
          </View>

          {/* Bar Chart */}
          <View style={styles.barChart}>
            {[40, 60, 45, 85, 30, 50, 20].map((height, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.barContainer,
                  idx === 3 ? highlightStyle : {},
                ]}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: idx === 3 ? C.purple : C.textHint,
                    },
                  ]}
                />
              </Animated.View>
            ))}
          </View>

          {/* Days Label */}
          <View style={styles.daysLabel}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <Text
                key={idx}
                style={[
                  styles.dayText,
                  {
                    color: idx === 3 ? C.purple : C.textTertiary,
                    fontWeight: idx === 3 ? '600' : '400',
                  },
                ]}
              >
                {day}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 60 },

  greeting: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  greetingText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
  },
  greetingSubtitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },

  heroSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },

  timerContainer: {
    marginBottom: Spacing.lg,
  },

  mascot: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  mascotEmoji: {
    fontSize: 48,
  },

  startBtn: {
    width: '100%',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  startBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: '#fff',
  },

  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  durationPill: {
    borderRadius: Radius.full,
    borderWidth: 0.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  durationText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
  },

  customDurationSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.sm,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  customBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  customBtnText: {
    fontFamily: Typography.fontSans,
    fontWeight: Typography.weight.medium,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  statsCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: Spacing.md,
  },
  statsCardHeader: {
    marginBottom: Spacing.sm,
  },
  statsLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: Typography.weight.semibold,
  },
  statsValue: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
  },
  statsUnit: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
  },
  statsCaption: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xs,
    marginTop: Spacing.xs,
  },

  performanceCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  perfTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
  },
  perfSubtitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
  },
  perfButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  chartCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: Spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  moreIcon: {
    fontSize: 20,
  },

  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  barContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: Radius.sm,
  },

  daysLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  dayText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
});
