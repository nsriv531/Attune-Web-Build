// stores/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, AIInsight, SmartSuggestion } from '@/types';

const AVATAR_LEVELS = [
  { level: 1, xpRequired: 0,    name: 'Seedling',  unlocks: ['Default Sage'] },
  { level: 2, xpRequired: 200,  name: 'Sprout',    unlocks: ['Night mode Sage'] },
  { level: 3, xpRequired: 500,  name: 'Scholar',   unlocks: ['Cosmic Sage skin'] },
  { level: 4, xpRequired: 1000, name: 'Focus Pro', unlocks: ['Animated aura'] },
  { level: 5, xpRequired: 2000, name: 'Sage',      unlocks: ['Custom name for avatar'] },
];

function getAvatarLevel(totalXp: number) {
  let level = AVATAR_LEVELS[0];
  for (const l of AVATAR_LEVELS) {
    if (totalXp >= l.xpRequired) level = l;
  }
  return level;
}

function xpToNextLevel(totalXp: number) {
  const current = getAvatarLevel(totalXp);
  const nextIdx = AVATAR_LEVELS.findIndex((l) => l.level === current.level) + 1;
  if (nextIdx >= AVATAR_LEVELS.length) return null;
  return AVATAR_LEVELS[nextIdx].xpRequired - totalXp;
}

// ─── Heatmap builder ─────────────────────────────────────────────────────────
// Returns a 4×7 grid (4 time slots × 7 days) with intensity values 0–1
function buildHeatmap(sessions: Session[]) {
  const grid: number[][] = Array.from({ length: 4 }, () => new Array(7).fill(0));
  const counts: number[][] = Array.from({ length: 4 }, () => new Array(7).fill(0));

  for (const session of sessions) {
    if (!session.startedAt) continue;
    const date = new Date(session.startedAt);
    const dayIndex = (date.getDay() + 6) % 7; // Mon=0 … Sun=6
    const hour = date.getHours();
    const slotIndex = hour < 10 ? 0 : hour < 14 ? 1 : hour < 18 ? 2 : 3;

    grid[slotIndex][dayIndex] += session.focusScore;
    counts[slotIndex][dayIndex] += 1;
  }

  // Normalise to 0–1
  let max = 0;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 7; c++)
      if (counts[r][c] > 0) {
        grid[r][c] = grid[r][c] / counts[r][c];
        if (grid[r][c] > max) max = grid[r][c];
      }

  if (max > 0)
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 7; c++)
        grid[r][c] = grid[r][c] / max;

  return grid;
}

// ─── Store ────────────────────────────────────────────────────────────────────
interface UserState {
  userId: string | null;
  name: string;
  streakDays: number;
  totalXp: number;
  totalSessions: number;
  sessions: Session[];
  insights: AIInsight[];
  suggestion: SmartSuggestion | null;
  heatmap: number[][];
  isLoadingInsights: boolean;

  // Actions
  setUser: (userId: string, name: string) => void;
  addSession: (session: Session) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  setSuggestion: (s: SmartSuggestion) => void;
  setInsights: (insights: AIInsight[]) => void;
  setLoadingInsights: (v: boolean) => void;

  // Computed helpers (called inline — not reactive)
  getAvatarLevel: () => ReturnType<typeof getAvatarLevel>;
  getXpToNext: () => number | null;
  getHeatmap: () => number[][];
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      name: 'Guest',
      streakDays: 0,
      totalXp: 0,
      totalSessions: 0,
      sessions: [],
      insights: [],
      suggestion: null,
      heatmap: Array.from({ length: 4 }, () => new Array(7).fill(0)),
      isLoadingInsights: false,

      setUser: (userId, name) => set({ userId, name }),

      addSession: (session) =>
        set((s) => {
          const sessions = [session, ...s.sessions];
          const heatmap = buildHeatmap(sessions);
          return {
            sessions,
            heatmap,
            totalSessions: s.totalSessions + 1,
          };
        }),

      addXP: (amount) =>
        set((s) => ({ totalXp: s.totalXp + amount })),

      incrementStreak: () =>
        set((s) => ({ streakDays: s.streakDays + 1 })),

      setSuggestion: (suggestion) => set({ suggestion }),
      setInsights: (insights) => set({ insights }),
      setLoadingInsights: (isLoadingInsights) => set({ isLoadingInsights }),

      getAvatarLevel: () => getAvatarLevel(get().totalXp),
      getXpToNext: () => xpToNextLevel(get().totalXp),
      getHeatmap: () => buildHeatmap(get().sessions),
      
      reset: () => set({
        userId: null,
        name: 'Guest',
        streakDays: 0,
        totalXp: 0,
        totalSessions: 0,
        sessions: [],
        insights: [],
        suggestion: null,
        heatmap: Array.from({ length: 4 }, () => new Array(7).fill(0)),
        isLoadingInsights: false,
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        name: state.name,
        streakDays: state.streakDays,
        totalXp: state.totalXp,
        totalSessions: state.totalSessions,
        sessions: state.sessions,
        heatmap: state.heatmap,
      }), // only save these fields
    }
  )
);
