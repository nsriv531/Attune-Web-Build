// app/reward.tsx  — Full-screen reward + reflection modal
import React, { useEffect, useState } from 'react';
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
  withDelay,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { SageAvatar } from '@/components/SageAvatar';
import { generateSageSuggestion } from '@/lib/claude';
import type { FocusFeeling, Session } from '@/types';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';

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
  bgCard,
  border,
}: {
  value: string | number;
  label: string;
  color: string;
  delay: number;
  bgCard: string;
  border: string;
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
    <Animated.View style={[styles.xpCard, { backgroundColor: bgCard, borderColor: border }, style]}>
      <Text style={[styles.xpNum, { color }]}>{value}</Text>
      <Text style={[styles.xpLabel, { color: `${color}88` }]}>{label}</Text>
    </Animated.View>
  );
}

export default function RewardScreen() {
  const C = useThemeColors();
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
  const { streakDays, sessions, name, addSession, addXP, incrementStreak, setSuggestion, setLoadingInsights } =
    useUserStore();

  const distractionEvents = useSessionStore.getState().distractionEvents;
  const distractionCount = distractionEvents.length;
  const distractionDuration = distractionEvents.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const distMin = Math.floor(distractionDuration / 60);
  const distSec = distractionDuration % 60;
  const distString = distMin > 0 ? `${distMin}m ${distSec}s` : `${distSec}s`;

  const { isSignedIn } = useAuth();
  const saveSessionMutation = useMutation(api.sessions.saveSession);
  const updateSessionFeelingMutation = useMutation(api.sessions.updateSessionFeeling);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const sageBounce = useSharedValue(0.5);
  const sageOpacity = useSharedValue(0);

  useEffect(() => {
    sageBounce.value = withSpring(1, { damping: 12, stiffness: 160 });
    sageOpacity.value = withTiming(1, { duration: 400 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
    fetchSuggestion([newSession, ...sessions]);
    saveToBackend();
  }, []);

  async function saveToBackend() {
    if (!isSignedIn) return;
    
    const state = useSessionStore.getState();
    try {
      const response = await saveSessionMutation({
        subject: state.subject,
        subjectId: state.subjectId,
        plannedDuration: state.durationMinutes,
        actualDuration: state.secondsElapsed,
        focusScore: state.focusScore,
        xpEarned: state.xpEarned,
        status: 'completed',
        feeling: state.feeling || undefined,
        tags: [],
        note: undefined,
        startedAt: Date.now() - state.secondsElapsed * 1000,
        distractions: state.distractionEvents.map((d) => ({
          type: d.type,
          durationSeconds: d.durationSeconds,
          timestamp: d.timestamp,
        })),
      });
      if (response && response.sessionId) {
        setSavedSessionId(response.sessionId);
      }
    } catch (error) {
      console.error('Failed to save session to Convex', error);
    }
  }

  async function fetchSuggestion(allSessions: Session[]) {
    try {
      setLoadingInsights(true);
      const suggestion = await generateSageSuggestion(allSessions.slice(0, 30), name);
      setSuggestion(suggestion);
    } catch (e) {
      // Fail silently
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
      <View style={[styles.glow, { pointerEvents: 'none' }]} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={sageStyle}>
          <SageAvatar size={80} state="celebrate" />
        </Animated.View>

        <Text style={[styles.title, { color: C.textPrimary }]}>Session complete!</Text>
        <Text style={[styles.subtitle, { color: C.textTertiary }]}>
          {durationMinutes} min · {subject}
        </Text>

        {distractionCount > 0 && (
          <View style={[styles.distractionBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: C.red }]}>
            <Text style={[styles.distractionText, { color: C.red }]}>
              Distracted {distractionCount} {distractionCount === 1 ? 'time' : 'times'} for {distString}
            </Text>
          </View>
        )}

        <View style={styles.xpRow}>
          <XPCard value={focusScore} label="Focus" color={C.green} delay={100} bgCard={C.bgCard} border={C.border} />
          <XPCard value={`+${xpEarned}`} label="XP" color={C.purple} delay={220} bgCard={C.bgCard} border={C.border} />
          <XPCard value={newStreak} label="Streak" color={C.amber} delay={340} bgCard={C.bgCard} border={C.border} />
        </View>

        <Text style={[styles.sectionLabel, { color: C.textTertiary }]}>How did it feel?</Text>
        <View style={styles.feelRow}>
          {FEELINGS.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.feelBtn,
                { backgroundColor: C.bgInput, borderColor: C.border },
                feeling === f.key && { backgroundColor: C.purpleDim, borderColor: C.purpleBorder },
              ]}
              onPress={() => {
                setFeeling(f.key);
                if (savedSessionId) {
                  updateSessionFeelingMutation({ sessionId: savedSessionId as any, feeling: f.key }).catch((e) => 
                    console.error('Failed to update feeling in Convex', e)
                  );
                }
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.feelText, { color: C.textTertiary }, feeling === f.key && { color: C.purple }]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.sageCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={styles.sageCardTop}>
            <SageAvatar size={30} state="watching" />
            <Text style={[styles.sageName, { color: C.purple }]}>Sage says</Text>
          </View>
          <Text style={[styles.sageMsg, { color: C.textSecondary }]}>
            {focusScore >= 85
              ? `You crushed it! Your peak hours are paying off. Keep this momentum going tomorrow.`
              : focusScore >= 65
              ? `Good session. A couple of distractions but you got back on track each time.`
              : `Tough session — that happens. Tomorrow you'll be sharper. Consider a shorter block next time.`}
          </Text>
        </View>

        <Pressable style={[styles.primaryBtn, { backgroundColor: C.purple }]} onPress={handleViewInsights}>
          <Text style={styles.primaryBtnText}>See my insights</Text>
        </Pressable>

        <Pressable style={[styles.secondaryBtn, { backgroundColor: C.bgInput, borderColor: C.border }]} onPress={handleDone}>
          <Text style={[styles.secondaryBtnText, { color: C.textTertiary }]}>Back to setup</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
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
  },
  subtitle: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.sm,
  },
  
  distractionBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    marginBottom: Spacing.sm,
  },
  distractionText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  xpRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  xpCard: {
    borderWidth: 0.5,
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
    borderWidth: 0.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  feelText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },

  sageCard: {
    width: '100%',
    borderWidth: 0.5,
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
    letterSpacing: 0.5,
  },
  sageMsg: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },

  primaryBtn: {
    width: '100%',
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
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },
});
