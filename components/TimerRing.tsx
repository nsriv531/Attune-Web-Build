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
import Svg, { Path } from 'react-native-svg';
import { Typography, RING_RADIUS, RING_SIZE } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

  // Calculate Arc Path (135 degrees to 45 degrees, clockwise)
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const r = RING_RADIUS;
  
  // Starting at -225 degrees (which is 135) to 45 degrees
  const startAngle = 135;
  const endAngle = 45;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  const startX = cx + r * Math.cos(startRad);
  const startY = cy + r * Math.sin(startRad);
  const endX = cx + r * Math.cos(endRad);
  const endY = cy + r * Math.sin(endRad);

  const d = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;
  const arcLength = (270 / 360) * 2 * Math.PI * r;

  useEffect(() => {
    const pct = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
    progress.value = withTiming(pct, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [secondsRemaining, totalSeconds]);

  const animatedProps = useAnimatedProps(() => {
    // Offset from arcLength (empty) to 0 (full)
    const offset = arcLength * (1 - progress.value);
    return {
      strokeDashoffset: offset,
      stroke: interpolateColor(
        progress.value,
        [0, 0.5, 1],
        [C.amber, C.amber, C.amber]
      ),
    };
  });

  const timeString = formatTime(secondsRemaining);

  return (
    <View style={styles.wrap}>
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        <Path
          d={d}
          fill="none"
          stroke="#F5EFE9" // Soft background track
          strokeWidth={8}
          strokeLinecap="round"
        />
        <AnimatedPath
          d={d}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          animatedProps={animatedProps}
        />
      </Svg>

      <View style={[styles.timeOverlay, { pointerEvents: 'none' }]}>
        <Text style={[styles.timeNum, { color: C.textPrimary }]}>{timeString}</Text>
        <Text style={[styles.timeLbl, { color: C.textTertiary }]}>MINUTES LEFT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '35%',
  },
  timeNum: {
    fontFamily: Typography.fontSans,
    fontSize: 48,
    fontWeight: Typography.weight.semibold,
    letterSpacing: -1,
    marginBottom: 4,
  },
  timeLbl: {
    fontFamily: Typography.fontSans,
    fontSize: 10,
    fontWeight: Typography.weight.medium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
