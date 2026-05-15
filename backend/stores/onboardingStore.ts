import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SoliForm = string;
export type CoachingStyle = 'gentle' | 'steady' | 'direct';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'late-night';
export type GoalType = 'deep-work' | 'daily-homework' | 'exam-prep' | 'building-habit';
export type OnboardingDuration = 15 | 25 | 50;

interface OnboardingState {
  soliForm: string;
  coachingStyle: CoachingStyle;
  subjects: string[];
  timeOfDay: TimeOfDay | null;
  distractions: string[];
  goal: GoalType | null;
  sessionDuration: OnboardingDuration;
  hasCompletedOnboarding: boolean | null;

  setSoliForm: (f: string) => void;
  setCoachingStyle: (s: CoachingStyle) => void;
  setSubjects: (s: string[]) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setDistractions: (d: string[]) => void;
  setGoal: (g: GoalType) => void;
  setSessionDuration: (d: OnboardingDuration) => void;
  checkOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboardingFlag: () => void;
}

export const ONBOARDING_STORAGE_KEY = 'attune_onboarding_v1';

export const useOnboardingStore = create<OnboardingState>((set) => ({
  soliForm: 'focus',
  coachingStyle: 'steady',
  subjects: [],
  timeOfDay: null,
  distractions: [],
  goal: null,
  sessionDuration: 25,
  hasCompletedOnboarding: null,

  setSoliForm: (soliForm) => set({ soliForm }),
  setCoachingStyle: (coachingStyle) => set({ coachingStyle }),
  setSubjects: (subjects) => set({ subjects }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setDistractions: (distractions) => set({ distractions }),
  setGoal: (goal) => set({ goal }),
  setSessionDuration: (sessionDuration) => set({ sessionDuration }),
  checkOnboarding: async () => {
    const val = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    set({ hasCompletedOnboarding: val === 'true' });
  },
  completeOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },
  resetOnboardingFlag: () => {
    set({ hasCompletedOnboarding: null });
  },
}));
