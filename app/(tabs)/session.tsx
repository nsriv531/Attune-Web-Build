// app/(tabs)/session.tsx  — Active focus session screen
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
  Platform,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, Radius, Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { useRitualAudio } from '@/hooks/useAudioPlayer';
import { TimerRing } from '@/components/TimerRing';
import { SoliOverlay } from '@/components/Mascots';
import { StatCard } from '@/components/StatCard';
import { MediaPlayer } from '@/components/MediaPlayer';

export default function SessionScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const {
    isActive,
    isPaused,
    setupComplete,
    subject,
    durationMinutes,
    secondsRemaining,
    soliState,
    soliMessage,
    ritualSound,
    endSession,
    clearDistraction,
    startSession,
  } = useSessionStore();

  const { streakDays, totalXp, totalSessions } = useUserStore();

  // Handle Ritual Audio
  const { player, currentTrack, nextTrack, prevTrack, loading } = useRitualAudio();

  // Block Android hardware back while a session is active — only exit is the end button
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (useSessionStore.getState().isActive) {
          handleEndEarly();
          return true; // swallow the event
        }
        return false;
      });
      return () => sub.remove();
    }, [])
  );

  function handleEndEarly() {
    const confirmEnd = () => {
      endSession();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.replace('/reflection');
    };

    if (Platform.OS === 'web') {
      // Alert.alert is a no-op on web — fall back to the browser dialog
      const ok = typeof window !== 'undefined'
        ? window.confirm('End session? Your progress so far will be saved and counted toward your streak.')
        : true;
      if (ok) confirmEnd();
      return;
    }

    Alert.alert(
      'End session?',
      'Your progress so far will be saved and counted toward your streak.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End session', style: 'destructive', onPress: confirmEnd },
      ]
    );
  }

  const totalSeconds = durationMinutes * 60;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const focusBadgeColor =
    soliState === 'alert'
      ? C.red
      : soliState === 'nudge'
      ? C.amber
      : C.green;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgSession }}>
      <View style={styles.container}>

        <Text style={[styles.subject, { color: C.textTertiary }]}>{subject}</Text>

        <TimerRing
          secondsRemaining={secondsRemaining}
          totalSeconds={totalSeconds}
          isRunning={isActive && !isPaused}
        >
          <Text style={[styles.timeDisplay, { color: C.textPrimary }]}>{timeDisplay}</Text>
          <Text style={[styles.timeLabel, { color: C.textTertiary }]}>remaining</Text>
        </TimerRing>

        <View style={[styles.focusBadge, { borderColor: `${focusBadgeColor}44`, backgroundColor: `${focusBadgeColor}12` }]}>
          <View style={[styles.focusDot, { backgroundColor: focusBadgeColor }]} />
          <Text style={[styles.focusText, { color: focusBadgeColor }]}>
            {soliState === 'alert'
              ? 'Come back'
              : soliState === 'nudge'
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

        {/* ── Soli overlay ── */}
        <SoliOverlay
          soliState={soliState}
          message={soliMessage}
          onDismiss={soliState === 'nudge' || soliState === 'alert' ? clearDistraction : undefined}
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
  timeDisplay: {
    fontFamily: Typography.fontSans,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 40,
    marginTop: 2,
  },
  timeLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
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
