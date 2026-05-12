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
import { useSessionStore } from '@/backend/stores/sessionStore';
import { useUserStore } from '@/backend/stores/userStore';
import TopAppBar from '@/components/TopAppBar';
import { TimerRing } from '@/components/TimerRing';
import { useRitualAudio } from '@/hooks/useAudioPlayer';
import type { RitualSound } from '@/types';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SageOtter } from '@/components/SageOtter';

const DURATIONS: number[] = [15, 18, 25, 45];

export default function HomeScreen() {
  const C = useThemeColors();
  const router = useRouter();

  const { isSignedIn } = useUser();
  const convexSessions = useQuery(api.sessions.list, isSignedIn ? { limit: 50 } : "skip");
  const convexStats = useQuery(api.sessions.getStats, isSignedIn ? {} : "skip");

  const { name, streakDays: localStreakDays, sessions: localSessions } = useUserStore();
  const sessions = isSignedIn ? (convexSessions ?? []) : localSessions;
  const streakDays = isSignedIn ? (convexStats?.streakDays ?? 0) : localStreakDays;

  // Background streak enforcement
  const enforceStreakMutation = useMutation(api.sessions.enforceStreak);
  useEffect(() => {
    if (isSignedIn) {
      enforceStreakMutation();
    }
  }, [isSignedIn, enforceStreakMutation]);
  const { durationMinutes, setDuration, startSession, ritualSound, setRitualSound } = useSessionStore();

  const { previewTimerActive } = useRitualAudio(true); // Enable audio previews on this screen

  // Animation for audio preview slider
  const previewProgress = useSharedValue(0);

  useEffect(() => {
    if (previewTimerActive) {
      previewProgress.value = 1;
      previewProgress.value = withTiming(0, { duration: 15000, easing: Easing.linear });
    } else {
      previewProgress.value = 0;
    }
  }, [previewTimerActive]);

  const previewBarStyle = useAnimatedStyle(() => ({
    width: `${previewProgress.value * 100}%`,
  }));

  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [customDuration, setCustomDuration] = useState('');

  // Calculate today's focused minutes
  const todayMinutes = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.reduce((total, session) => {
      if (!session.startedAt) return total;
      const sessionDate = new Date(session.startedAt);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === today.getTime()) {
        const minutes = ('durationMinutes' in session ? session.durationMinutes : (session as any).plannedDuration) || 0;
        return total + minutes;
      }
      return total;
    }, 0);
  }, [sessions]);

  // Calculate Weekly Equilibrium Data (Mon-Sun)
  const weeklyData = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const data = [0, 0, 0, 0, 0, 0, 0];

    sessions.forEach((session) => {
      if (!session.startedAt) return;
      const sDate = new Date(session.startedAt);
      sDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - sDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        let idx = sDate.getDay() - 1;
        if (idx === -1) idx = 6;
        data[idx] += ('durationMinutes' in session ? session.durationMinutes : (session as any).plannedDuration) || 0;
      }
    });

    const max = Math.max(...data, 60); // Base minimum max to prevent empty looking charts
    return data.map(val => Math.min((val / max) * 100, 100));
  }, [sessions]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession();
    router.navigate('/(tabs)/session');
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

          {/* Mascot */}
          <View style={styles.mascot}>
            <SageOtter size={170} state="watching" />
          </View>

          {/* Start CTA */}
          <Pressable
            style={[styles.startBtn, { backgroundColor: C.amber }]}
            onPress={handleStart}
          >
            <Text style={[styles.startBtnText, { color: C.textPrimary }]}>Start Focus Session</Text>
          </Pressable>

          {/* Duration Pills */}
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                style={[
                  styles.durationPill,
                  {
                    backgroundColor: durationMinutes === d ? C.amberDim : '#FFFFFF',
                    borderColor: durationMinutes === d ? C.amber : C.border,
                  },
                ]}
                onPress={() => handleDurationSelect(d)}
              >
                <Text
                  style={[
                    styles.durationText,
                    {
                      color: durationMinutes === d ? C.amber : C.textTertiary,
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
                styles.customPill,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: C.border,
                },
              ]}
              onPress={() => setShowDurationPicker(!showDurationPicker)}
            >
              <Text style={[styles.durationText, { color: C.textSecondary }]}>✎ Custom</Text>
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

        {/* ── Sound Selection ── */}
        <View style={styles.soundSection}>
          <Text style={[styles.soundSectionTitle, { color: C.textSecondary }]}>Ritual Sound</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.soundScroll}>
            {(['silence', 'lofi', 'rain', 'forest', 'white-noise'] as RitualSound[]).map((sound) => {
              const icons: Record<string, string> = {
                'silence': '🔇',
                'lofi': '🎧',
                'rain': '🌧',
                'forest': '🌲',
                'white-noise': '📻'
              };

              return (
                <Pressable
                  key={sound}
                  style={[
                    styles.soundPill,
                    {
                      backgroundColor: ritualSound === sound ? C.amberDim : '#FFFFFF',
                      borderColor: ritualSound === sound ? C.amber : C.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setRitualSound(sound);
                  }}
                >
                  <Text style={styles.soundIcon}>{icons[sound]}</Text>
                  <Text
                    style={[
                      styles.soundText,
                      {
                        color: ritualSound === sound ? C.amber : C.textTertiary,
                      },
                    ]}
                  >
                    {sound === 'white-noise' ? 'White Noise' : sound.charAt(0).toUpperCase() + sound.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {previewTimerActive && (
            <View style={styles.previewBarContainer}>
              <Animated.View style={[styles.previewBar, { backgroundColor: C.amber }, previewBarStyle]} />
            </View>
          )}
        </View>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: C.bgCard,
                borderColor: '#F2EBE5',
              },
            ]}
          >
            <View style={styles.statsCardHeader}>
              <Text style={[styles.statsIcon, { color: C.amber }]}>⏱</Text>
              <Text style={[styles.statsLabel, { color: C.amber }]}>TODAY</Text>
            </View>
            <View style={styles.statsValueRow}>
              <Text style={[styles.statsValue, { color: C.textPrimary }]}>{todayMinutes}</Text>
              <Text style={[styles.statsUnit, { color: C.textSecondary }]}>min</Text>
            </View>
            <Text style={[styles.statsCaption, { color: C.textTertiary }]}>Focused time</Text>
          </View>

          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: C.bgCard,
                borderColor: '#F2EBE5',
              },
            ]}
          >
            <View style={styles.statsCardHeader}>
              <Text style={[styles.statsIcon, { color: '#F97316' }]}>🔥</Text>
              <Text style={[styles.statsLabel, { color: '#F97316' }]}>STREAK</Text>
            </View>
            <View style={styles.statsValueRow}>
              <Text style={[styles.statsValue, { color: C.textPrimary }]}>{streakDays}</Text>
              <Text style={[styles.statsUnit, { color: C.textSecondary }]}>days</Text>
            </View>
            <Text style={[styles.statsCaption, { color: C.textTertiary }]}>In flow state</Text>
          </View>
        </View>

        {/* ── Performance Mode Glass Card ── */}
        <View
          style={[
            styles.performanceCard,
            {
              backgroundColor: '#FEF8F2',
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.perfTitle, { color: C.textPrimary }]}>Performance Mode</Text>
            <Text style={[styles.perfSubtitle, { color: C.textSecondary }]}>
              Enhanced focus for critical milestones.
            </Text>
          </View>
          <Pressable
            style={[
              styles.perfButton,
              {
                backgroundColor: '#292524',
              },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={{ fontSize: 18, color: '#fff' }}>⚡</Text>
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
            {weeklyData.map((height, idx) => (
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
                      backgroundColor: idx === 3 ? '#FFE0B2' : '#F9F6F4',
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
                    color: idx === 3 ? C.amber : C.textTertiary,
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
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#EBE7DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },

  startBtn: {
    width: '100%',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#FDBA31',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  startBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: 16,
    fontWeight: '500',
  },

  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  durationPill: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    minWidth: 54,
    alignItems: 'center',
  },
  customPill: {
    paddingHorizontal: Spacing.xl,
  },
  durationText: {
    fontFamily: Typography.fontSans,
    fontSize: 15,
    fontWeight: '500',
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

  soundSection: {
    marginBottom: Spacing.xl,
  },
  soundSectionTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  soundScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
    paddingVertical: 4,
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  soundIcon: {
    fontSize: 14,
  },
  soundText: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '500',
  },
  previewBarContainer: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  previewBar: {
    height: '100%',
    borderRadius: Radius.full,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  statsCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 6,
  },
  statsIcon: {
    fontSize: 14,
  },
  statsLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statsValue: {
    fontFamily: Typography.fontSans,
    fontSize: 28,
    fontWeight: '600',
  },
  statsUnit: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '400',
  },
  statsCaption: {
    fontFamily: Typography.fontSans,
    fontSize: 12,
    marginTop: 4,
  },

  performanceCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: 24,
    padding: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  perfTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  perfSubtitle: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    lineHeight: 20,
    paddingRight: Spacing.md,
  },
  perfButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  chartCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  chartTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 16,
    fontWeight: '500',
  },
  moreIcon: {
    fontSize: 24,
    lineHeight: 24,
  },

  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  barContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderRadius: 16,
  },

  daysLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  dayText: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    fontWeight: '500',
  },
});
