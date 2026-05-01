// components/TimerRing.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Typography, RING_RADIUS, RING_CIRCUMFERENCE, RING_SIZE } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerRingProps {
  secondsRemaining: number;
  totalSeconds: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TimerRing({ secondsRemaining, totalSeconds }: TimerRingProps) {
  const C = useThemeColors();
  const progress = useSharedValue(1);
  const accentColor = useSharedValue(C.purple);

  useEffect(() => {
    accentColor.value = C.purple;
  }, [C.purple]);

  useEffect(() => {
    const pct = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
    progress.value = withTiming(pct, {
      duration: 900,
      easing: Easing.linear,
    });
  }, [secondsRemaining, totalSeconds]);

  const animatedProps = useAnimatedProps(() => {
    const offset = RING_CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset: offset,
      stroke: interpolateColor(
        progress.value,
        [0, 0.5, 1],
        ['#5eead4', accentColor.value, accentColor.value]
      ),
    };
  });

  const timeString = formatTime(secondsRemaining);

  return (
    <View style={styles.wrap}>
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={`${C.textHint}`}
          strokeWidth={8}
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          animatedProps={animatedProps}
          rotation={-90}
          transformOrigin={`${RING_SIZE / 2}px ${RING_SIZE / 2}px`}
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS - 10}
          fill={C.bgSession}
        />
      </Svg>

      {/* Time display — floats over the SVG */}
      <View style={[styles.timeOverlay, { pointerEvents: 'none' }]}>
        <Text style={styles.timeNum}>{timeString}</Text>
        <Text style={styles.timeLbl}>remaining</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
  },
  timeOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.light,
    color: '#ffffff',
    letterSpacing: -1,
  },
  timeLbl: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
