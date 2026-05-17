import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { TimerRing } from '@/components/TimerRing';
import { KeycapButton, KeycapSurface } from '@/components/KeycapSurface';
import { SoliAvatar, SoliState } from '@/components/Mascots';
import { SageAvatar } from '@/components/SageAvatar';
import { useOnboardingStore } from '@/backend/stores/onboardingStore';
import { Colors, Typography, Spacing } from '@/constants/theme';

const SESSION_SECONDS = 60;

type MicroSoliState = 'watching' | 'nudge' | 'celebrate';

export default function MicroSessionScreen() {
  const router = useRouter();
  const { soliForm, subjects, completeOnboarding } = useOnboardingStore();

  const [countdown, setCountdown] = useState(SESSION_SECONDS);
  const [soliState, setSoliState] = useState<MicroSoliState>('watching');
  const [soliMessage, setSoliMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleExitEarly = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    await completeOnboarding();
    router.replace('/(tabs)' as never);
  };

  const ringPulse = useSharedValue(1);
  const messageOpacity = useSharedValue(0);
  const messageY = useSharedValue(8);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        const next = c - 1;
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setSoliState('celebrate');
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (countdown === 30 && soliState === 'watching') {
      setSoliState('nudge');
      setSoliMessage("I'm here.");
      setShowMessage(true);
      messageOpacity.value = withTiming(1, { duration: 400 });
      messageY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });

      const t = setTimeout(() => {
        setSoliState('watching');
        setShowMessage(false);
        messageOpacity.value = withTiming(0, { duration: 300 });
      }, 3000);

      return () => clearTimeout(t);
    }
  }, [countdown]);

  const doneRef = useRef(false);
  useEffect(() => {
    if (countdown === 0 && !doneRef.current) {
      doneRef.current = true;
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
  }, [countdown]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [{ translateY: messageY.value }],
  }));

  const ringWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringPulse.value }],
  }));

  const subject = subjects[0] ?? 'Focus';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.subject}>{subject.toUpperCase()}</Text>

        <Animated.View style={ringWrapStyle}>
          <TimerRing secondsRemaining={countdown} totalSeconds={SESSION_SECONDS} />
        </Animated.View>

        <View style={styles.sageWrap}>
          <SoliAvatar size={56} state={soliState as any} />
          {showMessage && (
            <Animated.View style={messageStyle}>
              <KeycapSurface radius={12} contentStyle={styles.messageBubbleFace}>
                <Text style={styles.messageText}>{soliMessage}</Text>
              </KeycapSurface>
            </Animated.View>
          )}
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  soliState === 'nudge'
                    ? Colors.amber
                    : Colors.green,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color:
                  soliState === 'nudge'
                    ? Colors.amber
                    : Colors.green,
              },
            ]}
          >
            {soliState === 'celebrate' ? 'Complete' : soliState === 'nudge' ? 'Drifting...' : 'In flow'}
          </Text>
        </View>

        <Text style={styles.note}>
          {countdown === 0 ? 'Session complete.' : 'Stay with it. Soli is watching.'}
        </Text>

        {countdown > 0 && !done && (
          <KeycapButton
            radius={8}
            style={styles.exitBtnOuter}
            contentStyle={styles.exitBtnFace}
            onPress={handleExitEarly}
          >
            <Text style={styles.exitButtonText}>Exit Early</Text>
          </KeycapButton>
        )}
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
  messageBubbleFace: {
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
    fontWeight: '500',
  },
  note: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  exitBtnOuter: {
    marginTop: Spacing.md,
  },
  exitBtnFace: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  exitButtonText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
