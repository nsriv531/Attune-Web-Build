import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, RING_CIRCUMFERENCE, RING_SIZE, RING_RADIUS } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import TopAppBar from '@/components/TopAppBar';
import { TimerRing } from '@/components/TimerRing';
import { KeycapSurface, KeycapButton } from '@/components/KeycapSurface';
import { useRitualAudio } from '@/hooks/useAudioPlayer';
import { SoliAvatar } from '@/components/SoliAvatar';
import { InteractiveIconButton } from '@/components/InteractiveIconButton';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import type { RitualSound } from '@/types';

const DURATIONS: number[] = [15, 18, 25, 45];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BAR_HEIGHTS = [40, 62, 48, 85, 32, 54, 22];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

// ── Animated bar for the weekly chart ─────────────────────────────────────
function AnimatedBar({ targetHeight, idx, isToday, accent }: {
  targetHeight: number;
  idx: number;
  isToday: boolean;
  accent: string;
}) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withDelay(
      idx * 60,
      withTiming(1, { duration: 500 + idx * 50, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    height: `${targetHeight * anim.value}%` as any,
  }));

  return (
    <View style={styles.barCol}>
      <View style={styles.barOuter}>
        {/* Keycap depth backing */}
        <View style={[styles.barDepth, {
          backgroundColor: isToday
            ? Colors.keycapAccentDepthColor
            : Colors.keycapDepthColor,
        }]}>
          <Animated.View style={[styles.barFace, {
            backgroundColor: isToday ? accent : Colors.bgCardHigh,
          }, barStyle]}>
            {/* Shine strip on active bar */}
            {isToday && (
              <View style={styles.barShine} />
            )}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

// ── Fade-slide-up entry animation wrapper ─────────────────────────────────
function FadeSlideUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

// ── Mascot idle animation ─────────────────────────────────────────────────
function AnimatedMascot({ size = 74 }: { size?: number }) {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(-1.5, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.5, { duration: 2100, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.01, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={style}>
      <SoliAvatar size={size} state="idle" />
    </Animated.View>
  );
}

// ── Duration pill ─────────────────────────────────────────────────────────
function DurationPill({ label, isActive, onPress }: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <KeycapButton
      accent={isActive}
      radius={14}
      style={styles.durationPillWrapper}
      contentStyle={styles.durationPillFace}
      onPress={onPress}
    >
      <Text style={[styles.durationText, { color: isActive ? '#2C2000' : Colors.textTertiary }]}>
        {label}
      </Text>
    </KeycapButton>
  );
}

// ── Sound pill ────────────────────────────────────────────────────────────
function SoundPill({ sound, isActive, onPress }: {
  sound: RitualSound;
  isActive: boolean;
  onPress: () => void;
}) {
  const icons: Record<string, string> = {
    'silence': '🔇', 'lofi': '🎧', 'rain': '🌧',
    'forest': '🌲', 'white-noise': '📻',
  };
  const label = sound === 'white-noise' ? 'White Noise'
    : sound.charAt(0).toUpperCase() + sound.slice(1);

  return (
    <KeycapButton
      accent={isActive}
      radius={Radius.full}
      style={{ marginRight: Spacing.sm }}
      contentStyle={styles.soundPillFace}
      onPress={onPress}
    >
      <Text style={styles.soundIcon}>{icons[sound]}</Text>
      <Text style={[styles.soundText, { color: isActive ? '#2C2000' : Colors.textTertiary }]}>
        {label}
      </Text>
    </KeycapButton>
  );
}

// ── Main home screen ──────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { name, streakDays, sessions } = useUserStore();
  const { durationMinutes, setDuration, startSession, ritualSound, setRitualSound } = useSessionStore();
  const { previewTimerActive } = useRitualAudio(true);

  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Preview progress bar
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
    width: `${previewProgress.value * 100}%` as any,
  }));

  // Today's focused minutes
  const todayMinutes = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.reduce((total, session) => {
      if (!session.startedAt) return total;
      const d = new Date(session.startedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() ? total + (session.durationMinutes || 0) : total;
    }, 0);
  }, [sessions]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const mins = durationMinutes;
  const secs = 0;
  const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession();
    router.navigate('/(tabs)/session');
  }

  function handleDurationSelect(duration: number) {
    setDuration(duration);
    Haptics.selectionAsync();
  }

  return (
    <>
      <SafeAreaView style={styles.safe}>
        <TopAppBar userName={name} onMenuPress={() => setMenuOpen(!menuOpen)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <FadeSlideUp delay={50}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>{greeting}, {name}</Text>
            <Text style={styles.greetingSubtitle}>The light is perfect for deep work today.</Text>
          </View>
        </FadeSlideUp>

        {/* ── Timer Hero Card ── */}
        <FadeSlideUp delay={120}>
          <View style={styles.heroCardWrapper}>
            <KeycapSurface radius={22} contentStyle={styles.heroCardFace}>
              {/* Timer ring with mascot + time inside */}
              <View style={styles.timerRingWrap}>
                <TimerRing
                  secondsRemaining={durationMinutes * 60}
                  totalSeconds={durationMinutes * 60}
                  isRunning={false}
                >
                  {/* Mascot + time display inside the ring */}
                  <AnimatedMascot size={70} />
                  <Text style={styles.timeDisplay}>{timeDisplay}</Text>
                  <Text style={styles.timeLabel}>remaining</Text>
                </TimerRing>
              </View>

              {/* Start button */}
              <KeycapButton
                accent
                radius={18}
                style={styles.startBtnWrapper}
                contentStyle={styles.startBtnFace}
                onPress={handleStart}
              >
                <Text style={styles.startBtnText}>▶  Start Focus Session</Text>
              </KeycapButton>

              {/* Duration pills */}
              <View style={styles.durationRow}>
                {DURATIONS.map(d => (
                  <DurationPill
                    key={d}
                    label={String(d)}
                    isActive={durationMinutes === d}
                    onPress={() => handleDurationSelect(d)}
                  />
                ))}
                <KeycapButton
                  radius={14}
                  style={styles.durationPillWrapper}
                  contentStyle={styles.durationPillFace}
                  onPress={() => setShowDurationPicker(!showDurationPicker)}
                >
                  <Text style={[styles.durationText, { color: Colors.textSecondary }]}>✎ Custom</Text>
                </KeycapButton>
              </View>
            </KeycapSurface>
          </View>
        </FadeSlideUp>

        {/* ── Sound Selection ── */}
        <FadeSlideUp delay={180}>
          <View style={styles.soundSection}>
            <Text style={styles.soundSectionTitle}>Ritual Sound</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.soundScroll}>
              {(['silence', 'lofi', 'rain', 'forest', 'white-noise'] as RitualSound[]).map(sound => (
                <SoundPill
                  key={sound}
                  sound={sound}
                  isActive={ritualSound === sound}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setRitualSound(sound);
                  }}
                />
              ))}
            </ScrollView>
            {previewTimerActive && (
              <View style={styles.previewBarContainer}>
                <Animated.View style={[styles.previewBar, previewBarStyle]} />
              </View>
            )}
          </View>
        </FadeSlideUp>

        {/* ── Stats Grid ── */}
        <FadeSlideUp delay={240}>
          <View style={styles.statsGrid}>
            {/* Today card */}
            <KeycapSurface radius={20} style={styles.statsCardWrapper} contentStyle={styles.statsCardFace}>
              <View style={styles.statsCardInner}>
                <View style={styles.statsCardHeader}>
                  <Text style={[styles.statsIcon, { color: Colors.amber }]}>⏱</Text>
                  <Text style={[styles.statsLabel, { color: Colors.amber }]}>TODAY</Text>
                </View>
                <View style={styles.statsValueRow}>
                  <Text style={styles.statsValue}>{todayMinutes}</Text>
                  <Text style={styles.statsUnit}>min</Text>
                </View>
                <Text style={styles.statsCaption}>Focused time</Text>
              </View>
            </KeycapSurface>

            {/* Streak card */}
            <KeycapSurface radius={20} style={styles.statsCardWrapper} contentStyle={styles.statsCardFace}>
              <View style={styles.statsCardInner}>
                <View style={styles.statsCardHeader}>
                  <Text style={[styles.statsIcon, { color: '#F97316' }]}>🔥</Text>
                  <Text style={[styles.statsLabel, { color: '#F97316' }]}>STREAK</Text>
                </View>
                <View style={styles.statsValueRow}>
                  <Text style={styles.statsValue}>{streakDays}</Text>
                  <Text style={styles.statsUnit}>days</Text>
                </View>
                <Text style={styles.statsCaption}>In flow state</Text>
              </View>
            </KeycapSurface>
          </View>
        </FadeSlideUp>

        {/* ── Performance Mode Card ── */}
        <FadeSlideUp delay={290}>
          <View style={styles.cardPad}>
            <KeycapSurface radius={20} contentStyle={styles.performanceFace}>
              <View style={{ flex: 1 }}>
                <Text style={styles.perfTitle}>Performance Mode</Text>
                <Text style={styles.perfSubtitle}>Enhanced focus for critical milestones.</Text>
              </View>
              <KeycapButton
                accent
                radius={14}
                style={styles.boltBtnWrapper}
                contentStyle={styles.boltBtnFace}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={styles.boltIcon}>⚡</Text>
              </KeycapButton>
            </KeycapSurface>
          </View>
        </FadeSlideUp>

        {/* ── Motivation Nudge ── */}
        <FadeSlideUp delay={320}>
          <View style={styles.cardPad}>
            <KeycapSurface radius={20} contentStyle={styles.nudgeFace}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nudgeTitle}>Feeling low on motivation?</Text>
                <Text style={styles.nudgeSubtitle}>Try a 5-min micro-session. It's the easiest way to start.</Text>
              </View>
              <KeycapButton
                accent
                radius={Radius.lg}
                style={styles.nudgeBtnWrapper}
                contentStyle={styles.nudgeBtnFace}
                onPress={() => { handleDurationSelect(5); handleStart(); }}
              >
                <Text style={styles.nudgeBtnText}>Start</Text>
              </KeycapButton>
            </KeycapSurface>
          </View>
        </FadeSlideUp>

        {/* ── Weekly Equilibrium Chart ── */}
        <FadeSlideUp delay={360}>
          <View style={styles.cardPad}>
            <KeycapSurface radius={22} contentStyle={styles.chartFace}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Weekly Equilibrium</Text>
                <Text style={styles.moreIcon}>⋯</Text>
              </View>

              <View style={styles.barChart}>
                {BAR_HEIGHTS.map((h, idx) => (
                  <AnimatedBar
                    key={idx}
                    targetHeight={h}
                    idx={idx}
                    isToday={idx === TODAY_IDX}
                    accent={Colors.amber}
                  />
                ))}
              </View>

              <View style={styles.daysLabel}>
                {DAYS.map((day, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.dayText,
                      {
                        color: idx === TODAY_IDX ? Colors.amber : Colors.textTertiary,
                        fontWeight: idx === TODAY_IDX ? '800' : '500',
                      },
                    ]}
                  >
                    {day}
                  </Text>
                ))}
              </View>
            </KeycapSurface>
          </View>
        </FadeSlideUp>

        {/* ── Rive Animation Test ── */}
        <FadeSlideUp delay={400}>
          <View style={styles.cardPad}>
            <KeycapSurface radius={20} contentStyle={styles.testFace}>
              <View style={styles.testHeader}>
                <Text style={styles.testTitle}>Rive Test</Text>
                <Text style={styles.testSubtitle}>Click to trigger animation</Text>
              </View>
              <View style={styles.testIconContainer}>
                <InteractiveIconButton
                  fileName="25691-49048-interactive-icon-set.riv"
                  size={64}
                  onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
                />
              </View>
            </KeycapSurface>
          </View>
        </FadeSlideUp>

        <View style={{ height: 24 }} />
      </ScrollView>
      </SafeAreaView>

      <ProfileSidebar visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const cardShadow = Platform.OS === 'ios'
  ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 }
  : { elevation: 2 };

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  content: { paddingBottom: 60 },

  // Greeting
  greeting: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 16,
    paddingTop: 4,
  },
  greetingText: {
    fontFamily: Typography.fontSans,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Timer hero card
  heroCardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  heroCardFace: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  timerRingWrap: {
    marginBottom: 14,
    alignItems: 'center',
  },

  // Time display (inside ring, as children)
  timeDisplay: {
    fontFamily: Typography.fontSans,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: Colors.textPrimary,
    lineHeight: 34,
    marginTop: -2,
  },
  timeLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },

  // Start button
  startBtnWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  startBtnFace: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2000',
    letterSpacing: 0.3,
  },

  // Duration pills
  durationRow: {
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  durationPillWrapper: {},
  durationPillFace: {
    paddingHorizontal: 17,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    fontWeight: '600',
  },

  // Sound section
  soundSection: {
    marginBottom: Spacing.xl,
  },
  soundSectionTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  soundScroll: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  soundPillFace: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  soundIcon: { fontSize: 14 },
  soundText: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    fontWeight: '600',
  },
  previewBarContainer: {
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  previewBar: {
    height: '100%',
    backgroundColor: Colors.amber,
    borderRadius: Radius.full,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  statsCardWrapper: { flex: 1 },
  statsCardFace: {},
  statsCardInner: {
    padding: 14,
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  statsIcon: { fontSize: 13 },
  statsLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statsValue: {
    fontFamily: Typography.fontSans,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  statsUnit: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  statsCaption: {
    fontFamily: Typography.fontSans,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },

  // General card padding wrapper
  cardPad: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Performance mode card
  performanceFace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 16,
  },
  perfTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  perfSubtitle: {
    fontFamily: Typography.fontSans,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  boltBtnWrapper: { flexShrink: 0 },
  boltBtnFace: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltIcon: { fontSize: 18 },

  // Nudge card
  nudgeFace: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
    gap: Spacing.md,
  },
  nudgeTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  nudgeSubtitle: {
    fontFamily: Typography.fontSans,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  nudgeBtnWrapper: { flexShrink: 0 },
  nudgeBtnFace: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2000',
  },

  // Weekly chart
  chartFace: {
    padding: 16,
    paddingBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  chartTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  moreIcon: {
    color: Colors.textTertiary,
    fontSize: 17,
    letterSpacing: 1,
  },

  // Bar chart
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 76,
    marginBottom: 9,
    gap: 5,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barOuter: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barDepth: {
    borderRadius: 6,
    paddingBottom: 2,
  },
  barFace: {
    borderRadius: 5,
    minHeight: 4,
    overflow: 'hidden',
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,245,160,0.55)',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  daysLabel: {
    flexDirection: 'row',
  },
  dayText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Typography.fontSans,
    fontSize: 11,
    fontWeight: '500',
  },

  // Rive test section
  testFace: {
    padding: 16,
    alignItems: 'center',
  },
  testHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  testTitle: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  testSubtitle: {
    fontFamily: Typography.fontSans,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  testIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
