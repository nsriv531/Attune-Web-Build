import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Clerk & Convex
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

SplashScreen.preventAutoHideAsync();

/* =========================
   0. DEV FLAGS
========================= */
// 🛠 DEV ONLY — flip to false (or delete) before shipping
const BYPASS_AUTH = __DEV__ && false;

/* =========================
   1. ENV VALIDATION
========================= */
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;
const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

console.log('ENV CHECK:', {
  CONVEX_URL: CONVEX_URL ? '✓ set' : '✗ missing',
  CLERK_KEY: CLERK_KEY ? '✓ set' : '✗ missing',
});

if (!CONVEX_URL || !CLERK_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_CONVEX_URL or EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env'
  );
}

/* =========================
   2. CLIENTS & CACHE
========================= */
const convex = new ConvexReactClient(CONVEX_URL);
const queryClient = new QueryClient();

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

import { useAuthStore } from '@/stores/authStore';
import { useTimer } from '@/hooks/useTimer';

/* =========================
   3. INITIAL LAYOUT (AUTH LOGIC)
========================= */
function AuthSync() {
  const { isSignedIn, user } = useUser();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (isSignedIn && user) {
      storeUser({
        name: user.fullName || user.username || 'User',
        email: user.primaryEmailAddress?.emailAddress,
      });
    }
  }, [isSignedIn, user, storeUser]);

  return null;
}

function GlobalTimer() {
  useTimer();
  return null;
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isGuest = useAuthStore((s) => s.isGuest);

  useEffect(() => {
    if (!isLoaded) return;

    // 🛠 DEV bypass — skip auth and force-route to tabs
    if (BYPASS_AUTH) {
      if (segments[0] === 'sign-in' || segments[0] === 'sign-up') {
        router.replace('/(tabs)');
      }
      return;
    }

    const inAuthGroup = segments[0] === 'sign-in' || segments[0] === 'sign-up';

    if (!isSignedIn && !isGuest && !inAuthGroup) {
      router.replace('/sign-in');
    } else if ((isSignedIn || isGuest) && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isGuest, isLoaded, segments]);

  return (
    <>
      <AuthSync />
      <GlobalTimer />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="reward"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

/* =========================
   4. ROOT LAYOUT (PROVIDERS)
========================= */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans: require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
    'DMSans-SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
    DMMono: require('../assets/fonts/DMMono-Regular.ttf'),
    'DMMono-Medium': require('../assets/fonts/DMMono-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <ClerkProvider publishableKey={CLERK_KEY!} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <InitialLayout />
          </QueryClientProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

// import { useEffect } from 'react';
// import { Stack, useRouter, useSegments } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { StyleSheet } from 'react-native';

// // Clerk & Convex
// import * as SecureStore from 'expo-secure-store';
// import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
// import { ConvexProviderWithClerk } from 'convex/react-clerk';
// import { ConvexReactClient, useMutation } from 'convex/react';
// import { api } from '../convex/_generated/api';

// SplashScreen.preventAutoHideAsync();

// /* =========================
//    1. ENV VALIDATION
// ========================= */
// const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;
// const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// console.log('ENV CHECK:', {
//   CONVEX_URL: CONVEX_URL ? '✓ set' : '✗ missing',
//   CLERK_KEY: CLERK_KEY ? '✓ set' : '✗ missing',
// });

// if (!CONVEX_URL || !CLERK_KEY) {
//   throw new Error(
//     'Missing EXPO_PUBLIC_CONVEX_URL or EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env'
//   );
// }

// /* =========================
//    2. CLIENTS & CACHE
// ========================= */
// const convex = new ConvexReactClient(CONVEX_URL);
// const queryClient = new QueryClient();

// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       return await SecureStore.getItemAsync(key);
//     } catch (err) {
//       return null;
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       await SecureStore.setItemAsync(key, value);
//     } catch (err) {
//       return; 
//     }
//   },
// };

// /* =========================
//    3. INITIAL LAYOUT (AUTH LOGIC)
// ========================= */
// function AuthSync() {
//   const { isSignedIn, user } = useUser();
//   const storeUser = useMutation(api.users.store);

//   useEffect(() => {
//     if (isSignedIn && user) {
//       storeUser({
//         name: user.fullName || user.username || 'User',
//         email: user.primaryEmailAddress?.emailAddress,
//       });
//     }
//   }, [isSignedIn, user, storeUser]);

//   return null;
// }

// function InitialLayout() {
//   const { isLoaded, isSignedIn } = useAuth();
//   const segments = useSegments();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoaded) return;

//     // Check if the user is currently within the auth screens (sign-in/sign-up)
//     const inAuthGroup = segments[0] === 'sign-in' || segments[0] === 'sign-up';

//     if (!isSignedIn && !inAuthGroup) {
//       // If NOT logged in and NOT on an auth page, send them to sign-in
//       router.replace('/sign-in');
//     } else if (isSignedIn && inAuthGroup) {
//       // If logged in but trying to access auth pages, send them home
//       router.replace('/(tabs)');
//     }
//   }, [isSignedIn, isLoaded, segments]);

//   return (
//     <>
//       <AuthSync />
//       <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
//         <Stack.Screen name="sign-in" />
//         <Stack.Screen name="sign-up" />
//         <Stack.Screen name="(tabs)" />
//         <Stack.Screen
//           name="reward"
//           options={{
//             presentation: 'fullScreenModal',
//             animation: 'slide_from_bottom',
//           }}
//         />
//       </Stack>
//     </>
//   );
// }

// /* =========================
//    4. ROOT LAYOUT (PROVIDERS)
// ========================= */
// export default function RootLayout() {
//   const [fontsLoaded, fontError] = useFonts({
//     DMSans: require('../assets/fonts/DMSans-Regular.ttf'),
//     'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
//     'DMSans-SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
//     DMMono: require('../assets/fonts/DMMono-Regular.ttf'),
//     'DMMono-Medium': require('../assets/fonts/DMMono-Medium.ttf'),
//   });

//   useEffect(() => {
//     if (fontsLoaded || fontError) {
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded, fontError]);

//   if (!fontsLoaded && !fontError) return null;

//   return (
//     <GestureHandlerRootView style={styles.root}>
//       <ClerkProvider publishableKey={CLERK_KEY!} tokenCache={tokenCache}>
//         <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
//           <QueryClientProvider client={queryClient}>
//             <StatusBar style="light" />
//             <InitialLayout />
//           </QueryClientProvider>
//         </ConvexProviderWithClerk>
//       </ClerkProvider>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
// });