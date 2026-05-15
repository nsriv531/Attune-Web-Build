// stores/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, AIInsight, SmartSuggestion } from '@/types';

export const AVATAR_LEVELS = [
  { level: 1, xpRequired: 0,    name: 'Seedling',  unlocks: ['Default Sage'] },
  { level: 2, xpRequired: 200,  name: 'Sprout',    unlocks: ['Night mode Sage'] },
  { level: 3, xpRequired: 500,  name: 'Scholar',   unlocks: ['Cosmic Sage skin'] },
  { level: 4, xpRequired: 1000, name: 'Focus Pro', unlocks: ['Animated aura'] },
  { level: 5, xpRequired: 2000, name: 'Sage',      unlocks: ['Custom name for avatar'] },
];

export function getAvatarLevel(totalXp: number) {
  let level = AVATAR_LEVELS[0];
  for (const l of AVATAR_LEVELS) {
    if (totalXp >= l.xpRequired) level = l;
  }
  return level;
}

export function xpToNextLevel(totalXp: number) {
  const current = getAvatarLevel(totalXp);
  const nextIdx = AVATAR_LEVELS.findIndex((l) => l.level === current.level) + 1;
  if (nextIdx >= AVATAR_LEVELS.length) return 0;
  return AVATAR_LEVELS[nextIdx].xpRequired - totalXp;
}

// ─── Heatmap builder ─────────────────────────────────────────────────────────
export function buildHeatmap(sessions: Session[]) {
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
  bookmarkedResourceIds: string[];
  isLoadingInsights: boolean;

  // Actions
  setUser: (userId: string, name: string) => void;
  addSession: (session: Session) => void;
  deleteLastSession: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  setSuggestion: (s: SmartSuggestion | null) => void;
  setInsights: (insights: AIInsight[]) => void;
  toggleBookmark: (resourceId: string) => void;
  setLoadingInsights: (v: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      name: 'Guest',
      streakDays: 0,
      totalXp: 0,
      totalSessions: 0,
      sessions: [],
      insights: [],
      suggestion: null,
      heatmap: Array.from({ length: 4 }, () => new Array(7).fill(0)),
      bookmarkedResourceIds: [],
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

      deleteLastSession: () =>
        set((s) => {
          if (s.sessions.length === 0) return {};
          
          const sessionToDelete = s.sessions[0];
          const newSessions = s.sessions.slice(1);
          const heatmap = buildHeatmap(newSessions);

          // Approximate XP to deduct based on the reverse calculation
          const xpToDeduct = Math.floor(sessionToDelete.timeOverall / 60) + 
            (sessionToDelete.focusScore >= 90 ? 20 : sessionToDelete.focusScore >= 75 ? 10 : sessionToDelete.focusScore >= 60 ? 5 : 0);

          return {
            sessions: newSessions,
            heatmap,
            totalSessions: Math.max(0, s.totalSessions - 1),
            totalXp: Math.max(0, s.totalXp - xpToDeduct)
          };
        }),

      addXP: (amount) =>
        set((s) => ({ totalXp: s.totalXp + amount })),

      incrementStreak: () =>
        set((s) => ({ streakDays: s.streakDays + 1 })),

      setSuggestion: (suggestion) => set({ suggestion }),
      setInsights: (insights) => set({ insights }),
      
      toggleBookmark: (resourceId) =>
        set((s) => {
          const isBookmarked = s.bookmarkedResourceIds.includes(resourceId);
          if (isBookmarked) {
            return { bookmarkedResourceIds: s.bookmarkedResourceIds.filter((id) => id !== resourceId) };
          } else {
            return { bookmarkedResourceIds: [...s.bookmarkedResourceIds, resourceId] };
          }
        }),

      setLoadingInsights: (isLoadingInsights) => set({ isLoadingInsights }),
      
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
        bookmarkedResourceIds: [],
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
        bookmarkedResourceIds: state.bookmarkedResourceIds,
      }),
    }
  )
);
