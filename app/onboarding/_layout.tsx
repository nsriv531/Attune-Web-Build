import { Stack } from 'expo-router';

export default function OnboardingStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="soli-reveal" />
      <Stack.Screen name="soli-form" />
      <Stack.Screen name="soli-style" />
      <Stack.Screen name="quiz-subject" />
      <Stack.Screen name="quiz-time" />
      <Stack.Screen name="quiz-distraction" />
      <Stack.Screen name="quiz-goal" />
      <Stack.Screen name="quiz-duration" />
      <Stack.Screen name="soli-learning" />
      <Stack.Screen name="soli-plan" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="pre-session" />
      <Stack.Screen name="micro-session" options={{ gestureEnabled: false }} />
      <Stack.Screen name="first-reward" options={{ gestureEnabled: false }} />
      <Stack.Screen name="reflection" />
      <Stack.Screen name="tomorrow" />
    </Stack>
  );
}
