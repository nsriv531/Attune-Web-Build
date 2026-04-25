// app/reward.tsx  — Full-screen reward + reflection modal
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { SageAvatar } from '@/components/SageAvatar';
import { generateSageSuggestion } from '@/lib/claude';
import type { FocusFeeling, Session } from '@/types';

const FEELINGS: { key: FocusFeeling; label: string }[] = [
  { key: 'solid', label: 'Solid' },
  { key: 'good',  label: 'Good' },
  { key: 'rough', label: 'Rough' },
];

function XPCard({
  value,
  label,
  color,
  delay,
}: {
  value: string | number;
  label: string;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 180 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.xpCard, style]}>
      <Text style={[styles.xpNum, { color }]}>{value}</Text>
      <Text style={[styles.xpLabel, { color: `${color}88` }]}>{label}</Text>
    </Animated.View>
  );
}

export default function RewardScreen() {
  const router = useRouter();
  const {
    subject,
    durationMinutes,
    focusScore,
    xpEarned,
    feeling,
    setFeeling,
    reset,
  } = useSessionStore();
  const { streakDays, totalXp, sessions, name, addSession, addXP, incrementStreak, setSuggestion, setLoadingInsights } =
    useUserStore();

  const sageBounce = useSharedValue(0.5);
  const sageOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation for Sage
    sageBounce.value = withSpring(1, { damping: 12, stiffness: 160 });
    sageOpacity.value = withTiming(1, { duration: 400 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Record the completed session into user store
    const newSession: Session = {
      id: `session-${Date.now()}`,
      subject,
      subjectId: 'bio-1',
      durationMinutes,
      startedAt: Date.now() - durationMinutes * 60 * 1000,
      endedAt: Date.now(),
      focusScore,
      distractionEvents: useSessionStore.getState().distractionEvents,
      feeling: undefined,
      xpEarned,
      completed: true,
    };

    addSession(newSession);
    addXP(xpEarned);
    if (streakDays > 0) incrementStreak();

    // Fire off AI suggestion generation async
    fetchSuggestion([newSession, ...sessions]);
  }, []);

  async function fetchSuggestion(allSessions: Session[]) {
    try {
      setLoadingInsights(true);
      const suggestion = await generateSageSuggestion(allSessions.slice(0, 30), name);
      setSuggestion(suggestion);
    } catch (e) {
      // Fail silently — the user never sees a broken state
    } finally {
      setLoadingInsights(false);
    }
  }

  const sageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sageBounce.value }],
    opacity: sageOpacity.value,
  }));

  function handleDone() {
    reset();
    router.replace('/(tabs)');
  }

  function handleViewInsights() {
    reset();
    router.replace('/(tabs)/insights');
  }

  const newStreak = streakDays + 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Glow bg element */}
      <View style={styles.glow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sage avatar ── */}
        <Animated.View style={sageStyle}>
          <SageAvatar size={80} state="celebrate" />
        </Animated.View>

        {/* ── Title ── */}
        <Text style={styles.title}>Session complete!</Text>
        <Text style={styles.subtitle}>
          {durationMinutes} min · {subject}
        </Text>

        {/* ── XP cards ── */}
        <View style={styles.xpRow}>
          <XPCard value={focusScore} label="Focus" color={Colors.green} delay={100} />
          <XPCard value={`+${xpEarned}`} label="XP" color={Colors.purple} delay={220} />
          <XPCard value={newStreak} label="Streak" color={Colors.amber} delay={340} />
        </View>

        {/* ── Feeling prompt ── */}
        <Text style={styles.sectionLabel}>How did it feel?</Text>
        <View style={styles.feelRow}>
          {FEELINGS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.feelBtn, feeling === f.key && styles.feelBtnSel]}
              onPress={() => {
                setFeeling(f.key);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.feelText, feeling === f.key && styles.feelTextSel]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Sage message card ── */}
        <View style={styles.sageCard}>
          <View style={styles.sageCardTop}>
            <SageAvatar size={30} state="watching" />
            <Text style={styles.sageName}>Sage says</Text>
          </View>
          <Text style={styles.sageMsg}>
            {focusScore >= 85
              ? `You crushed it! Your peak hours are paying off. Keep this momentum going tomorrow.`
              : focusScore >= 65
              ? `Good session. A couple of distractions but you got back on track each time.`
              : `Tough session — that happens. Tomorrow you'll be sharper. Consider a shorter block next time.`}
          </Text>
        </View>

        {/* ── CTA buttons ── */}
        <Pressable style={styles.primaryBtn} onPress={handleViewInsights}>
          <Text style={styles.primaryBtnText}>See my insights</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={handleDone}>
          <Text style={styles.secondaryBtnText}>Back to setup</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgSession,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.purpleDim,
    top: '20%',
    alignSelf: 'center',
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: 48,
    gap: Spacing.base,
  },

  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },

  xpRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  xpCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minWidth: 90,
  },
  xpNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
  },
  xpLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },

  sectionLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  feelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.sm,
  },
  feelBtn: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  feelBtnSel: {
    backgroundColor: Colors.purpleDim,
    borderColor: Colors.purpleBorder,
  },
  feelText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
  feelTextSel: { color: Colors.purple },

  sageCard: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  sageCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sageName: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.purple,
    letterSpacing: 0.5,
  },
  sageMsg: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.purple,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: '#fff',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: Colors.bgInput,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
});
