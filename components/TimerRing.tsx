// components/TimerRing.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { RING_RADIUS, RING_CIRCUMFERENCE, RING_SIZE, Colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerRingProps {
  secondsRemaining: number;
  totalSeconds: number;
  isRunning?: boolean;
  children?: React.ReactNode;
}

export function TimerRing({ secondsRemaining, totalSeconds, isRunning = false, children }: TimerRingProps) {
  const cx = RING_SIZE / 2;
  const progress = useSharedValue(1);

  // Animate progress when time changes
  useEffect(() => {
    const pct = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
    progress.value = withTiming(pct, {
      duration: 550,
      easing: Easing.out(Easing.quad),
    });
  }, [secondsRemaining, totalSeconds]);

  // Timer pulse — subtle scale breathe while running
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (isRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.012, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Ring glow — amber drop shadow while running
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (isRunning) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1250, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.35, { duration: 1250, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 400 });
    }
  }, [isRunning]);

  // Animated arc props
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <Animated.View style={[styles.wrap, pulseStyle]}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svg}>
        {/* Etched groove track — dark inner shadow */}
        <Circle
          cx={cx}
          cy={cx}
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(44,40,32,0.10)"
          strokeWidth={13}
        />
        {/* Track highlight — white sheen over groove */}
        <Circle
          cx={cx}
          cy={cx}
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Amber progress arc */}
        <G rotation="-90" origin={`${cx}, ${cx}`}>
          <AnimatedCircle
            cx={cx}
            cy={cx}
            r={RING_RADIUS}
            fill="none"
            stroke={Colors.amber}
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            animatedProps={arcProps}
          />
        </G>
      </Svg>

      {/* Center content — mascot + time display passed as children */}
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
