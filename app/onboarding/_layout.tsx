import { Stack } from 'expo-router';

export default function OnboardingStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sage-reveal" />
      <Stack.Screen name="sage-form" />
      <Stack.Screen name="sage-style" />
      <Stack.Screen name="quiz-subject" />
      <Stack.Screen name="quiz-time" />
      <Stack.Screen name="quiz-distraction" />
      <Stack.Screen name="quiz-goal" />
      <Stack.Screen name="quiz-duration" />
      <Stack.Screen name="sage-learning" />
      <Stack.Screen name="sage-plan" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="pre-session" />
      <Stack.Screen name="micro-session" options={{ gestureEnabled: false }} />
      <Stack.Screen name="first-reward" options={{ gestureEnabled: false }} />
      <Stack.Screen name="reflection" />
      <Stack.Screen name="tomorrow" />
    </Stack>
  );
}
