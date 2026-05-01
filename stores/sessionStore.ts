// stores/sessionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DistractionEvent, FocusFeeling, SessionDuration, RitualSound, ReflectionReason, SoliState } from '@/types';

// ─── Focus score algorithm ───────────────────────────────────────────────────
// Score starts at 100. Each distraction event deducts points based on severity.
// Idle < 30s = -2, app switch = -5, idle > 60s = -8, scroll burst = -3
function calculateFocusScore(events: DistractionEvent[], durationSeconds: number): number {
  let penalty = 0;
  for (const e of events) {
    if (e.type === 'app-switch') penalty += 5;
    else if (e.type === 'scroll-burst') penalty += 3;
    else if (e.type === 'idle') {
      penalty += e.durationSeconds > 60 ? 8 : 2;
    }
  }
  // Normalise: more distractions per minute = higher penalty weight
  const minutes = durationSeconds / 60;
  const densityMultiplier = Math.min(1 + (events.length / (minutes * 2)), 2);
  return Math.max(0, Math.round(100 - penalty * densityMultiplier));
}

// ─── XP formula ─────────────────────────────────────────────────────────────
// Base XP = duration in minutes. Bonus for high focus scores.
function calculateXP(durationMinutes: number, focusScore: number): number {
  const base = durationMinutes;
  const bonus = focusScore >= 90 ? 20 : focusScore >= 75 ? 10 : focusScore >= 60 ? 5 : 0;
  return base + bonus;
}

// ─── Store shape ─────────────────────────────────────────────────────────────
interface SessionState {
  // Config (set before session starts)
  subject: string;
  subjectId: string;
  durationMinutes: SessionDuration;
  ritualSound: RitualSound;
  setupComplete: boolean;

  // Runtime
  isActive: boolean;
  isPaused: boolean;
  secondsRemaining: number;
  secondsElapsed: number;
  startedAt: number | null;
  distractionEvents: DistractionEvent[];

  // Soli
  soliMessage: string;
  soliState: SoliState;
  consecutiveDistractionSeconds: number;

  // Computed after end
  focusScore: number;
  xpEarned: number;
  feeling: FocusFeeling | null;
  wasEndedEarly: boolean;
  reflectionReason: ReflectionReason | null;
  reflectionNote: string;

  // Actions
  setSubject: (subject: string, id: string) => void;
  setDuration: (duration: SessionDuration) => void;
  setRitualSound: (sound: RitualSound) => void;
  startSession: () => void;
  tick: () => void;
  fastForward: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  recordDistraction: (event: DistractionEvent) => void;
  clearDistraction: () => void;
  endSession: () => void;
  setFeeling: (feeling: FocusFeeling) => void;
  setReflection: (reason: ReflectionReason, note: string) => void;
  reset: () => void;
}

const SOLI_MESSAGES = {
  watching: [
    "You're doing great — keep going.",
    "Stay with it, you're in the zone.",
    "Solid focus. Keep this up.",
  ],
  nudge: [
    "Hey, still with me? Let's finish strong.",
    "Come back — just a few more minutes.",
    "You've got this. Back to it.",
  ],
  alert: [
    "Your streak is safe — come back now.",
    "3 minutes away. Let's get back.",
    "You're close to the end. Stay focused.",
  ],
};

function pickMessage(state: 'watching' | 'nudge' | 'alert'): string {
  const msgs = SOLI_MESSAGES[state];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      subject: 'Biology — Chapter 7',
      subjectId: 'bio-1',
      durationMinutes: 45,
      ritualSound: 'silence',
      setupComplete: false,

      isActive: false,
      isPaused: false,
      secondsRemaining: 45 * 60,
      secondsElapsed: 0,
      startedAt: null,
      distractionEvents: [],

      soliMessage: pickMessage('watching'),
      soliState: 'watching',
      consecutiveDistractionSeconds: 0,

      focusScore: 0,
      xpEarned: 0,
      feeling: null,
      wasEndedEarly: false,
      reflectionReason: null,
      reflectionNote: '',

      // ─ Config setters ──────────────────────────────────────────────────────────
      setSubject: (subject, id) => set({ subject, subjectId: id }),
      setDuration: (duration) => set({ durationMinutes: duration, secondsRemaining: duration * 60 }),
      setRitualSound: (ritualSound) => set({ ritualSound }),

      // ─ Session lifecycle ───────────────────────────────────────────────────────
      startSession: () =>
        set((s) => ({
          isActive: true,
          isPaused: false,
          secondsRemaining: s.durationMinutes * 60,
          secondsElapsed: 0,
          startedAt: Date.now(),
          distractionEvents: [],
          soliState: 'watching',
          soliMessage: pickMessage('watching'),
          consecutiveDistractionSeconds: 0,
          focusScore: 0,
          xpEarned: 0,
          feeling: null,
          wasEndedEarly: false,
          reflectionReason: null,
          reflectionNote: '',
        })),

      tick: () =>
        set((s) => {
          if (!s.isActive || s.isPaused) return s;
          const secondsRemaining = s.secondsRemaining - 1;
          const secondsElapsed = s.secondsElapsed + 1;

          // Rotate Sage's message every 5 minutes
          const shouldRefreshMsg = secondsElapsed % 300 === 0;

          return {
            secondsRemaining: Math.max(0, secondsRemaining),
            secondsElapsed,
            soliMessage: shouldRefreshMsg ? pickMessage('watching') : s.soliMessage,
          };
        }),

      fastForward: (seconds: number) =>
        set((s) => {
          if (!s.isActive || s.isPaused) return s;
          const secondsRemaining = Math.max(0, s.secondsRemaining - seconds);
          const secondsElapsed = s.secondsElapsed + seconds;

          const shouldRefreshMsg = Math.floor(secondsElapsed / 300) > Math.floor(s.secondsElapsed / 300);

          return {
            secondsRemaining,
            secondsElapsed,
            soliMessage: shouldRefreshMsg ? pickMessage('watching') : s.soliMessage,
          };
        }),

      pause: () => set({ isPaused: true }),
      resume: () => set({ isPaused: false }),

      recordDistraction: (event) =>
        set((s) => {
          const events = [...s.distractionEvents, event];
          const consecutive = s.consecutiveDistractionSeconds + event.durationSeconds;

          // Escalate Sage state based on consecutive distraction time
          let soliState = s.soliState;
          let soliMessage = s.soliMessage;

          if (consecutive >= 60) {
            soliState = 'alert';
            soliMessage = pickMessage('alert');
          } else if (consecutive >= 30) {
            soliState = 'nudge';
            soliMessage = pickMessage('nudge');
          }

          return { distractionEvents: events, consecutiveDistractionSeconds: consecutive, soliState, soliMessage };
        }),

      clearDistraction: () =>
        set({
          consecutiveDistractionSeconds: 0,
          soliState: 'watching',
          soliMessage: pickMessage('watching'),
        }),

      endSession: () =>
        set((s) => {
          const focusScore = calculateFocusScore(s.distractionEvents, s.secondsElapsed);
          const xpEarned = calculateXP(s.durationMinutes, focusScore);
          return {
            isActive: false,
            focusScore,
            xpEarned,
            soliState: 'celebrate',
            wasEndedEarly: s.secondsRemaining > 0,
          };
        }),

      setFeeling: (feeling) => set({ feeling }),

      setReflection: (reason, note) => set({ reflectionReason: reason, reflectionNote: note }),

      reset: () =>
        set((s) => ({
          isActive: false,
          isPaused: false,
          secondsRemaining: s.durationMinutes * 60,
          secondsElapsed: 0,
          startedAt: null,
          distractionEvents: [],
          soliState: 'watching',
          soliMessage: pickMessage('watching'),
          consecutiveDistractionSeconds: 0,
          focusScore: 0,
          xpEarned: 0,
          feeling: null,
          wasEndedEarly: false,
          reflectionReason: null,
          reflectionNote: '',
        })),
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        subject: state.subject,
        subjectId: state.subjectId,
        durationMinutes: state.durationMinutes,
        ritualSound: state.ritualSound,
      }), // only persist config settings, not active run state
    }
  )
);
