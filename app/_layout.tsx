// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
});

// ─── Safely require a font — returns undefined if the file doesn't exist yet.
// This prevents Metro from crashing during development before fonts are added.
function safeRequire(path: string): number | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path) as number;
  } catch {
    return undefined;
  }
}

const fontMap: Record<string, number | undefined> = {
  DMSans:            safeRequire('../assets/fonts/DMSans-Regular.ttf'),
  'DMSans-Medium':   safeRequire('../assets/fonts/DMSans-Medium.ttf'),
  'DMSans-SemiBold': safeRequire('../assets/fonts/DMSans-SemiBold.ttf'),
  DMMono:            safeRequire('../assets/fonts/DMMono-Regular.ttf'),
  'DMMono-Medium':   safeRequire('../assets/fonts/DMMono-Medium.ttf'),
};

// Only pass fonts that resolved to an actual file
const fontsToLoad = Object.fromEntries(
  Object.entries(fontMap).filter(([, v]) => v !== undefined)
) as Record<string, number>;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(
    Object.keys(fontsToLoad).length > 0 ? fontsToLoad : {}
  );

  useEffect(() => {
    // Hide splash once fonts loaded OR on error — prevents the app hanging forever
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="reward"
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
