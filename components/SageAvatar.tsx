import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Line, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

export type SageState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';
export type SageForm = 'orb' | 'crystal' | 'flame' | 'constellation';

interface SageAvatarProps {
  size?: number;
  state?: SageState;
  form?: SageForm;
}

const STATE_COLORS: Record<SageState, { ring: string; glow: string }> = {
  idle:      { ring: 'rgba(167,139,250,0.2)', glow: 'transparent' },
  watching:  { ring: 'rgba(167,139,250,0.4)', glow: 'rgba(167,139,250,0.08)' },
  nudge:     { ring: 'rgba(251,191,36,0.5)',  glow: 'rgba(251,191,36,0.08)' },
  alert:     { ring: 'rgba(248,113,113,0.5)', glow: 'rgba(248,113,113,0.08)' },
  celebrate: { ring: 'rgba(74,222,128,0.5)',  glow: 'rgba(74,222,128,0.08)' },
};

function OrbForm({ size, state }: { size: number; state: SageState }) {
  const cx = size / 2;
  const headR = size * 0.33;
  const bodyRx = size * 0.38;
  const bodyRy = size * 0.18;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Ellipse cx={cx} cy={size * 0.88} rx={bodyRx} ry={bodyRy} fill={Colors.purpleMid} />
      <Circle cx={cx} cy={size * 0.42} r={headR} fill={Colors.purple} />
      <Circle cx={cx - headR * 0.28} cy={size * 0.4} r={headR * 0.18} fill="#e0d7ff" />
      <Circle cx={cx + headR * 0.28} cy={size * 0.4} r={headR * 0.18} fill="#e0d7ff" />
      {state === 'celebrate' ? (
        <Path
          d={`M ${cx - headR * 0.3} ${size * 0.5} Q ${cx} ${size * 0.58} ${cx + headR * 0.3} ${size * 0.5}`}
          stroke="#e0d7ff" strokeWidth={headR * 0.1} strokeLinecap="round" fill="none"
        />
      ) : state === 'alert' ? (
        <Path
          d={`M ${cx - headR * 0.25} ${size * 0.54} Q ${cx} ${size * 0.5} ${cx + headR * 0.25} ${size * 0.54}`}
          stroke="#e0d7ff" strokeWidth={headR * 0.09} strokeLinecap="round" fill="none"
        />
      ) : (
        <Path
          d={`M ${cx - headR * 0.28} ${size * 0.5} Q ${cx} ${size * 0.56} ${cx + headR * 0.28} ${size * 0.5}`}
          stroke="#e0d7ff" strokeWidth={headR * 0.09} strokeLinecap="round" fill="none"
        />
      )}
    </Svg>
  );
}

function CrystalForm({ size, state }: { size: number; state: SageState }) {
  const cx = size / 2;
  const top = size * 0.06;
  const right = cx + size * 0.42;
  const bottom = size * 0.94;
  const left = cx - size * 0.42;
  const mid = size * 0.5;
  const eyeY = size * 0.4;
  const eyeR = size * 0.055;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Diamond body */}
      <Path
        d={`M ${cx} ${top} L ${right} ${mid} L ${cx} ${bottom} L ${left} ${mid} Z`}
        fill={Colors.purple}
      />
      {/* Facet lines */}
      <Path
        d={`M ${cx} ${top} L ${cx} ${bottom}`}
        stroke="rgba(224,215,255,0.15)" strokeWidth={0.5} fill="none"
      />
      <Path
        d={`M ${left} ${mid} L ${right} ${mid}`}
        stroke="rgba(224,215,255,0.15)" strokeWidth={0.5} fill="none"
      />
      {/* Eyes */}
      <Circle cx={cx - size * 0.1} cy={eyeY} r={eyeR} fill="#e0d7ff" />
      <Circle cx={cx + size * 0.1} cy={eyeY} r={eyeR} fill="#e0d7ff" />
      {/* Mouth */}
      {state === 'celebrate' ? (
        <Path
          d={`M ${cx - size * 0.1} ${size * 0.52} Q ${cx} ${size * 0.61} ${cx + size * 0.1} ${size * 0.52}`}
          stroke="#e0d7ff" strokeWidth={size * 0.025} strokeLinecap="round" fill="none"
        />
      ) : state === 'alert' ? (
        <Path
          d={`M ${cx - size * 0.08} ${size * 0.57} Q ${cx} ${size * 0.52} ${cx + size * 0.08} ${size * 0.57}`}
          stroke="#e0d7ff" strokeWidth={size * 0.022} strokeLinecap="round" fill="none"
        />
      ) : (
        <Path
          d={`M ${cx - size * 0.1} ${size * 0.53} Q ${cx} ${size * 0.6} ${cx + size * 0.1} ${size * 0.53}`}
          stroke="#e0d7ff" strokeWidth={size * 0.022} strokeLinecap="round" fill="none"
        />
      )}
    </Svg>
  );
}

function FlameForm({ size, state }: { size: number; state: SageState }) {
  const cx = size / 2;
  const eyeY = size * 0.44;
  const eyeR = size * 0.055;

  const flamePath = [
    `M ${cx} ${size * 0.06}`,
    `C ${cx + size * 0.42} ${size * 0.06} ${cx + size * 0.44} ${size * 0.48} ${cx + size * 0.32} ${size * 0.72}`,
    `Q ${cx + size * 0.22} ${size * 0.92} ${cx} ${size * 0.94}`,
    `Q ${cx - size * 0.22} ${size * 0.92} ${cx - size * 0.32} ${size * 0.72}`,
    `C ${cx - size * 0.44} ${size * 0.48} ${cx - size * 0.42} ${size * 0.06} ${cx} ${size * 0.06}`,
    'Z',
  ].join(' ');

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={flamePath} fill={Colors.purple} />
      {/* Inner glow hint */}
      <Path
        d={`M ${cx} ${size * 0.15} C ${cx + size * 0.28} ${size * 0.15} ${cx + size * 0.3} ${size * 0.45} ${cx + size * 0.2} ${size * 0.64} Q ${cx} ${size * 0.8} ${cx - size * 0.2} ${size * 0.64} C ${cx - size * 0.3} ${size * 0.45} ${cx - size * 0.28} ${size * 0.15} ${cx} ${size * 0.15} Z`}
        fill="rgba(224,215,255,0.06)"
      />
      <Circle cx={cx - size * 0.1} cy={eyeY} r={eyeR} fill="#e0d7ff" />
      <Circle cx={cx + size * 0.1} cy={eyeY} r={eyeR} fill="#e0d7ff" />
      {state === 'celebrate' ? (
        <Path
          d={`M ${cx - size * 0.1} ${size * 0.56} Q ${cx} ${size * 0.64} ${cx + size * 0.1} ${size * 0.56}`}
          stroke="#e0d7ff" strokeWidth={size * 0.025} strokeLinecap="round" fill="none"
        />
      ) : state === 'alert' ? (
        <Path
          d={`M ${cx - size * 0.08} ${size * 0.6} Q ${cx} ${size * 0.55} ${cx + size * 0.08} ${size * 0.6}`}
          stroke="#e0d7ff" strokeWidth={size * 0.022} strokeLinecap="round" fill="none"
        />
      ) : (
        <Path
          d={`M ${cx - size * 0.1} ${size * 0.57} Q ${cx} ${size * 0.64} ${cx + size * 0.1} ${size * 0.57}`}
          stroke="#e0d7ff" strokeWidth={size * 0.022} strokeLinecap="round" fill="none"
        />
      )}
    </Svg>
  );
}

function ConstellationForm({ size, state }: { size: number; state: SageState }) {
  const cx = size / 2;
  const stars = [
    { x: cx,              y: size * 0.1,  r: size * 0.045 }, // top
    { x: cx + size * 0.34, y: size * 0.3,  r: size * 0.035 }, // top-right
    { x: cx + size * 0.28, y: size * 0.62, r: size * 0.04  }, // bottom-right
    { x: cx,              y: size * 0.78, r: size * 0.035 }, // bottom
    { x: cx - size * 0.28, y: size * 0.62, r: size * 0.04  }, // bottom-left
    { x: cx - size * 0.34, y: size * 0.3,  r: size * 0.035 }, // top-left
    { x: cx,              y: size * 0.44, r: size * 0.07  }, // center (face)
  ];

  const lineColor = 'rgba(167,139,250,0.35)';
  const lineW = size * 0.012;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Connecting lines */}
      {[0,1,2,3,4,5].map((i) => (
        <Line
          key={i}
          x1={stars[i].x} y1={stars[i].y}
          x2={stars[(i+1) % 6].x} y2={stars[(i+1) % 6].y}
          stroke={lineColor} strokeWidth={lineW}
        />
      ))}
      {/* Lines to center */}
      {[0,1,2,3,4,5].map((i) => (
        <Line
          key={`c${i}`}
          x1={stars[i].x} y1={stars[i].y}
          x2={stars[6].x} y2={stars[6].y}
          stroke={lineColor} strokeWidth={lineW * 0.6}
        />
      ))}
      {/* Stars */}
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={Colors.purple} />
      ))}
      {/* Eyes on center star */}
      <Circle cx={stars[6].x - size * 0.025} cy={stars[6].y - size * 0.018} r={size * 0.018} fill="#e0d7ff" />
      <Circle cx={stars[6].x + size * 0.025} cy={stars[6].y - size * 0.018} r={size * 0.018} fill="#e0d7ff" />
      {state === 'celebrate' ? (
        <Path
          d={`M ${stars[6].x - size * 0.038} ${stars[6].y + size * 0.018} Q ${stars[6].x} ${stars[6].y + size * 0.04} ${stars[6].x + size * 0.038} ${stars[6].y + size * 0.018}`}
          stroke="#e0d7ff" strokeWidth={size * 0.018} strokeLinecap="round" fill="none"
        />
      ) : state === 'alert' ? (
        <Path
          d={`M ${stars[6].x - size * 0.03} ${stars[6].y + size * 0.025} Q ${stars[6].x} ${stars[6].y + size * 0.01} ${stars[6].x + size * 0.03} ${stars[6].y + size * 0.025}`}
          stroke="#e0d7ff" strokeWidth={size * 0.016} strokeLinecap="round" fill="none"
        />
      ) : (
        <Path
          d={`M ${stars[6].x - size * 0.035} ${stars[6].y + size * 0.015} Q ${stars[6].x} ${stars[6].y + size * 0.038} ${stars[6].x + size * 0.035} ${stars[6].y + size * 0.015}`}
          stroke="#e0d7ff" strokeWidth={size * 0.016} strokeLinecap="round" fill="none"
        />
      )}
    </Svg>
  );
}

export function SageAvatar({ size = 48, state = 'watching', form = 'orb' }: SageAvatarProps) {
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
      {form === 'crystal' ? (
        <CrystalForm size={size} state={state} />
      ) : form === 'flame' ? (
        <FlameForm size={size} state={state} />
      ) : form === 'constellation' ? (
        <ConstellationForm size={size} state={state} />
      ) : (
        <OrbForm size={size} state={state} />
      )}
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
