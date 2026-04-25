// hooks/useTimer.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouter } from 'expo-router';

export function useTimer() {
  const { isActive, isPaused, secondsRemaining, tick, endSession, recordDistraction, clearDistraction } =
    useSessionStore();
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');
  const backgroundTimeRef = useRef<number | null>(null);
  const distractionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Main countdown interval ─────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const store = useSessionStore.getState();
      if (store.secondsRemaining <= 1) {
        clearInterval(intervalRef.current!);
        store.endSession();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/reward');
        return;
      }
      store.tick();

      // Haptic pulse at halfway mark
      const total = store.durationMinutes * 60;
      const halfway = Math.floor(total / 2);
      if (store.secondsElapsed === halfway) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);

  // ─── App background/foreground distraction detection ─────────────────────
  useEffect(() => {
    if (!isActive) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (prev === 'active' && nextState === 'background') {
        // User left the app
        backgroundTimeRef.current = Date.now();

        // Start a distraction timer that escalates every 10s
        distractionTimerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - (backgroundTimeRef.current ?? Date.now())) / 1000);
          if (elapsed >= 10) {
            recordDistraction({
              timestamp: Date.now(),
              type: 'app-switch',
              durationSeconds: elapsed,
            });
          }
        }, 10_000);
      }

      if (nextState === 'active' && prev === 'background') {
        // User came back
        if (distractionTimerRef.current) {
          clearInterval(distractionTimerRef.current);
          distractionTimerRef.current = null;
        }

        const elapsed = backgroundTimeRef.current
          ? Math.floor((Date.now() - backgroundTimeRef.current) / 1000)
          : 0;

        backgroundTimeRef.current = null;

        if (elapsed >= 5) {
          recordDistraction({
            timestamp: Date.now(),
            type: 'app-switch',
            durationSeconds: elapsed,
          });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          clearDistraction();
        }
      }
    });

    return () => {
      subscription.remove();
      if (distractionTimerRef.current) clearInterval(distractionTimerRef.current);
    };
  }, [isActive]);

  return { secondsRemaining };
}
