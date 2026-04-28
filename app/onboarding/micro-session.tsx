import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { TimerRing } from '@/components/TimerRing';
import { SageAvatar } from '@/components/SageAvatar';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Colors, Typography, Spacing } from '@/constants/theme';

const SESSION_SECONDS = 60;

type MicroSageState = 'watching' | 'nudge' | 'celebrate';

export default function MicroSessionScreen() {
  const router = useRouter();
  const { sageForm, subjects } = useOnboardingStore();

  const [countdown, setCountdown] = useState(SESSION_SECONDS);
  const [sageState, setSageState] = useState<MicroSageState>('watching');
  const [sageMessage, setSageMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ringPulse = useSharedValue(1);
  const messageOpacity = useSharedValue(0);
  const messageY = useSharedValue(8);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        const next = c - 1;
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setSageState('celebrate');
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Scripted moment at 30s remaining: Sage transitions to nudge with "I'm here."
  useEffect(() => {
    if (countdown === 30 && sageState === 'watching') {
      setSageState('nudge');
      setSageMessage("I'm here.");
      setShowMessage(true);
      messageOpacity.value = withTiming(1, { duration: 400 });
      messageY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });

      const t = setTimeout(() => {
        setSageState('watching');
        setShowMessage(false);
        messageOpacity.value = withTiming(0, { duration: 300 });
      }, 3000);

      return () => clearTimeout(t);
    }
  }, [countdown]);

  // On session complete: ring pulse + navigate
  useEffect(() => {
    if (countdown === 0 && !done) {
      setDone(true);
      ringPulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        2,
        false
      );

      const t = setTimeout(() => {
        router.push('/onboarding/first-reward' as never);
      }, 1200);

      return () => clearTimeout(t);
    }
  }, [countdown, done]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [{ translateY: messageY.value }],
  }));

  const ringWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringPulse.value }],
  }));

  const subject = subjects[0] ?? 'Focus';
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Subject label */}
        <Text style={styles.subject}>{subject.toUpperCase()}</Text>

        {/* Timer ring */}
        <Animated.View style={ringWrapStyle}>
          <TimerRing secondsRemaining={countdown} totalSeconds={SESSION_SECONDS} />
        </Animated.View>

        {/* Sage avatar */}
        <View style={styles.sageWrap}>
          <SageAvatar size={56} state={sageState} form={sageForm} />
          {showMessage && (
            <Animated.View style={[styles.messageBubble, messageStyle]}>
              <Text style={styles.messageText}>{sageMessage}</Text>
            </Animated.View>
          )}
        </View>

        {/* Status label */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  sageState === 'nudge'
                    ? Colors.amber
                    : sageState === 'celebrate'
                    ? Colors.green
                    : Colors.green,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color:
                  sageState === 'nudge'
                    ? Colors.amber
                    : sageState === 'celebrate'
                    ? Colors.green
                    : Colors.green,
              },
            ]}
          >
            {sageState === 'celebrate' ? 'Complete' : sageState === 'nudge' ? 'Drifting...' : 'In flow'}
          </Text>
        </View>

        {/* Micro-session note */}
        <Text style={styles.note}>
          {countdown === 0 ? 'Session complete.' : 'Stay with it. Sage is watching.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgSession,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  subject: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
  },
  sageWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  messageBubble: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.borderMid,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  messageText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  note: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
