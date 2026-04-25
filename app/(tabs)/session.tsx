// app/(tabs)/session.tsx  — Active focus session screen
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { useTimer } from '@/hooks/useTimer';
import { TimerRing } from '@/components/TimerRing';
import { SageOverlay } from '@/components/SageOverlay';
import { StatCard } from '@/components/StatCard';

export default function SessionScreen() {
  const router = useRouter();
  const {
    isActive,
    subject,
    durationMinutes,
    secondsRemaining,
    sageState,
    sageMessage,
    endSession,
    clearDistraction,
    startSession,
  } = useSessionStore();

  const { streakDays, totalXp, totalSessions } = useUserStore();

  // Kick the timer hook — it manages AppState distraction detection
  useTimer();

  // If user lands here without an active session (e.g. deep link), redirect to setup
  useEffect(() => {
    if (!isActive) {
      // Give Reanimated a tick before navigating
      const t = setTimeout(() => router.replace('/(tabs)'), 100);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  function handleEndEarly() {
    Alert.alert(
      'End session?',
      'Your progress so far will be saved and counted toward your streak.',
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'End session',
          style: 'destructive',
          onPress: () => {
            endSession();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.push('/reward');
          },
        },
      ]
    );
  }

  const totalSeconds = durationMinutes * 60;
  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const minutesLeft = Math.ceil(secondsRemaining / 60);

  // Focus badge color changes with sage state
  const focusBadgeColor =
    sageState === 'alert'
      ? '#f87171'
      : sageState === 'nudge'
      ? Colors.amber
      : Colors.green;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── Subject label ── */}
        <Text style={styles.subject}>{subject}</Text>

        {/* ── Timer ring ── */}
        <TimerRing secondsRemaining={secondsRemaining} totalSeconds={totalSeconds} />

        {/* ── Focus state badge ── */}
        <View style={[styles.focusBadge, { borderColor: `${focusBadgeColor}44`, backgroundColor: `${focusBadgeColor}12` }]}>
          <View style={[styles.focusDot, { backgroundColor: focusBadgeColor }]} />
          <Text style={[styles.focusText, { color: focusBadgeColor }]}>
            {sageState === 'alert'
              ? 'Come back'
              : sageState === 'nudge'
              ? 'Drifting...'
              : 'In flow'}
          </Text>
        </View>

        {/* ── Sage overlay ── */}
        <SageOverlay
          sageState={sageState}
          message={sageMessage}
          onDismiss={sageState === 'nudge' || sageState === 'alert' ? clearDistraction : undefined}
        />

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatCard value={totalSessions} label="Total" />
          <StatCard value={streakDays} label="Streak" valueColor={Colors.amber} />
          <StatCard value={totalXp} label="XP" valueColor={Colors.purple} />
        </View>

        {/* ── End early ── */}
        <Pressable style={styles.endBtn} onPress={handleEndEarly}>
          <Text style={styles.endBtnText}>End session early</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgSession,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.base,
  },

  subject: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
  },

  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 0.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  focusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  focusText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },

  endBtn: {
    marginTop: 'auto',
    width: '100%',
    backgroundColor: Colors.bgInput,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  endBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
});
