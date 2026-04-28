import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SageForm = 'orb' | 'crystal' | 'flame' | 'constellation';
export type CoachingStyle = 'gentle' | 'steady' | 'direct';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'late-night';
export type GoalType = 'deep-work' | 'daily-homework' | 'exam-prep' | 'building-habit';
export type OnboardingDuration = 15 | 25 | 50;

interface OnboardingState {
  sageForm: SageForm;
  coachingStyle: CoachingStyle;
  subjects: string[];
  timeOfDay: TimeOfDay | null;
  distractions: string[];
  goal: GoalType | null;
  sessionDuration: OnboardingDuration;

  setSageForm: (f: SageForm) => void;
  setCoachingStyle: (s: CoachingStyle) => void;
  setSubjects: (s: string[]) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setDistractions: (d: string[]) => void;
  setGoal: (g: GoalType) => void;
  setSessionDuration: (d: OnboardingDuration) => void;
  completeOnboarding: () => Promise<void>;
}

export const ONBOARDING_STORAGE_KEY = 'attune_onboarding_v1';

export const useOnboardingStore = create<OnboardingState>((set) => ({
  sageForm: 'orb',
  coachingStyle: 'steady',
  subjects: [],
  timeOfDay: null,
  distractions: [],
  goal: null,
  sessionDuration: 25,

  setSageForm: (sageForm) => set({ sageForm }),
  setCoachingStyle: (coachingStyle) => set({ coachingStyle }),
  setSubjects: (subjects) => set({ subjects }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setDistractions: (distractions) => set({ distractions }),
  setGoal: (goal) => set({ goal }),
  setSessionDuration: (sessionDuration) => set({ sessionDuration }),
  completeOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  },
}));
