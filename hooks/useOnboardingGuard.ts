import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { ONBOARDING_STORAGE_KEY } from '@/backend/stores/onboardingStore';

export function useOnboardingGuard() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_STORAGE_KEY).then((val) => {
      const inOnboarding = segments[0] === 'onboarding';
      if (!val && !inOnboarding) {
        router.replace('/onboarding');
      }
    });
  }, []);
}
