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
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { useTimer } from '@/hooks/useTimer';
import { useRitualAudio } from '@/hooks/useAudioPlayer';
import { TimerRing } from '@/components/TimerRing';
import { SageOverlay } from '@/components/SageOverlay';
import { StatCard } from '@/components/StatCard';
import { MediaPlayer } from '@/components/MediaPlayer';

export default function SessionScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const {
    isActive,
    subject,
    durationMinutes,
    secondsRemaining,
    sageState,
    sageMessage,
    ritualSound,
    endSession,
    clearDistraction,
    startSession,
  } = useSessionStore();

  const { streakDays, totalXp, totalSessions } = useUserStore();

  useTimer();
  
  // Handle Ritual Audio
  const { player, currentTrack, nextTrack, prevTrack, loading } = useRitualAudio();

  // If user lands here without an active session (e.g. deep link), redirect to setup
  useEffect(() => {
    if (!isActive) {
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

  const focusBadgeColor =
    sageState === 'alert'
      ? C.red
      : sageState === 'nudge'
      ? C.amber
      : C.green;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgSession }}>
      <View style={styles.container}>

        <Text style={[styles.subject, { color: C.textTertiary }]}>{subject}</Text>

        <TimerRing secondsRemaining={secondsRemaining} totalSeconds={totalSeconds} />

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

        {/* ── Audio Controls ── */}
        <MediaPlayer
          player={player}
          track={currentTrack}
          onNext={nextTrack}
          onPrev={prevTrack}
          loading={loading}
        />

        {/* ── Sage overlay ── */}
        <SageOverlay
          sageState={sageState}
          message={sageMessage}
          onDismiss={sageState === 'nudge' || sageState === 'alert' ? clearDistraction : undefined}
        />

        <View style={styles.statsRow}>
          <StatCard value={totalSessions} label="Total" />
          <StatCard value={streakDays} label="Streak" valueColor={C.amber} />
          <StatCard value={totalXp} label="XP" valueColor={C.purple} />
        </View>

        <Pressable
          style={[styles.endBtn, { backgroundColor: C.bgInput, borderColor: C.border }]}
          onPress={handleEndEarly}
        >
          <Text style={[styles.endBtnText, { color: C.textTertiary }]}>End session early</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  audioBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  audioText: {
    fontFamily: Typography.fontMono,
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  endBtn: {
    marginTop: 'auto',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  endBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },
});
