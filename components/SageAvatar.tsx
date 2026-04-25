// components/SageAvatar.tsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

type SageState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';

interface SageAvatarProps {
  size?: number;
  state?: SageState;
}

const STATE_COLORS: Record<SageState, { ring: string; glow: string }> = {
  idle:      { ring: 'rgba(167,139,250,0.2)', glow: 'transparent' },
  watching:  { ring: 'rgba(167,139,250,0.4)', glow: 'rgba(167,139,250,0.08)' },
  nudge:     { ring: 'rgba(251,191,36,0.5)',  glow: 'rgba(251,191,36,0.08)' },
  alert:     { ring: 'rgba(248,113,113,0.5)', glow: 'rgba(248,113,113,0.08)' },
  celebrate: { ring: 'rgba(74,222,128,0.5)',  glow: 'rgba(74,222,128,0.08)' },
};

export function SageAvatar({ size = 48, state = 'watching' }: SageAvatarProps) {
  const scale = useSharedValue(1);
  const colors = STATE_COLORS[state];

  useEffect(() => {
    if (state === 'celebrate') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 300 }),
          withTiming(0.95, { duration: 200 }),
          withTiming(1, { duration: 150 })
        ),
        3,
        false
      );
    } else if (state === 'nudge' || state === 'alert') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 400 }),
          withTiming(0.98, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cx = size / 2;
  const headR = size * 0.33;
  const bodyRx = size * 0.38;
  const bodyRy = size * 0.18;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          width: size + 8,
          height: size + 8,
          borderRadius: (size + 8) / 2,
          backgroundColor: colors.glow,
          borderColor: colors.ring,
        },
        animStyle,
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Ellipse cx={cx} cy={size * 0.88} rx={bodyRx} ry={bodyRy} fill={Colors.purpleMid} />
        <Circle cx={cx} cy={size * 0.42} r={headR} fill={Colors.purple} />
        <Circle cx={cx - headR * 0.28} cy={size * 0.4} r={headR * 0.18} fill="#e0d7ff" />
        <Circle cx={cx + headR * 0.28} cy={size * 0.4} r={headR * 0.18} fill="#e0d7ff" />
        {state === 'celebrate' ? (
          <Path
            d={`M ${cx - headR * 0.3} ${size * 0.5} Q ${cx} ${size * 0.58} ${cx + headR * 0.3} ${size * 0.5}`}
            stroke="#e0d7ff"
            strokeWidth={headR * 0.1}
            strokeLinecap="round"
            fill="none"
          />
        ) : state === 'alert' ? (
          <Path
            d={`M ${cx - headR * 0.25} ${size * 0.54} Q ${cx} ${size * 0.5} ${cx + headR * 0.25} ${size * 0.54}`}
            stroke="#e0d7ff"
            strokeWidth={headR * 0.09}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <Path
            d={`M ${cx - headR * 0.28} ${size * 0.5} Q ${cx} ${size * 0.56} ${cx + headR * 0.28} ${size * 0.5}`}
            stroke="#e0d7ff"
            strokeWidth={headR * 0.09}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});