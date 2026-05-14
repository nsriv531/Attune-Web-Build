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
import Svg, { Circle, Path } from 'react-native-svg';
import { RING_RADIUS, RING_SIZE, Colors } from '@/constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// M3 Expressive wavy progress tuning
const WAVE_CYCLES = 18;        // sine cycles around the full ring
const SAMPLES_PER_CYCLE = 10;  // path resolution per cycle
const WAVE_AMPLITUDE = 4.5;    // peak radial offset in px when running
const EDGE_FADE = 0.05;        // wave flattens over this much of progress at each end

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

  // Wave phase scroll + amplitude — only animates while running
  const phase = useSharedValue(0);
  const waveAmp = useSharedValue(0);
  useEffect(() => {
    if (isRunning) {
      phase.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 5500, easing: Easing.linear }),
        -1,
        false
      );
      waveAmp.value = withTiming(WAVE_AMPLITUDE, { duration: 600, easing: Easing.out(Easing.quad) });
    } else {
      waveAmp.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    }
  }, [isRunning]);

  // Build the wavy active arc as an SVG path on the UI thread
  const wavePathProps = useAnimatedProps(() => {
    const p = progress.value;
    if (p <= 0.001) return { d: '' };

    const totalSamples = Math.max(2, Math.floor(p * WAVE_CYCLES * SAMPLES_PER_CYCLE));
    const startAngle = -Math.PI / 2; // 12 o'clock
    const amp = waveAmp.value;
    const ph = phase.value;
    let d = '';
    for (let i = 0; i <= totalSamples; i++) {
      const t = (i / totalSamples) * p; // 0..p
      const headFade = Math.min(1, (p - t) / EDGE_FADE);
      const tailFade = Math.min(1, t / EDGE_FADE);
      const localAmp = amp * Math.max(0, Math.min(headFade, tailFade));
      const angle = startAngle + t * 2 * Math.PI;
      const r = RING_RADIUS + localAmp * Math.sin(t * WAVE_CYCLES * 2 * Math.PI + ph);
      const x = cx + r * Math.cos(angle);
      const y = cx + r * Math.sin(angle);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
    }
    return { d };
  });

  return (
    <Animated.View style={[styles.wrap, pulseStyle]}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svg}>
        {/* M3 inactive track — same shape & weight as the active arc, muted amber */}
        <Circle
          cx={cx}
          cy={cx}
          r={RING_RADIUS}
          fill="none"
          stroke={Colors.amberDim}
          strokeWidth={11}
          strokeLinecap="round"
        />
        {/* M3 stop indicator — small dot at the resting position (12 o'clock) */}
        <Circle
          cx={cx}
          cy={cx - RING_RADIUS}
          r={3.5}
          fill={Colors.amber}
        />
        {/* Wavy amber active arc — M3 Expressive */}
        <AnimatedPath
          fill="none"
          stroke={Colors.amber}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={wavePathProps}
        />
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
