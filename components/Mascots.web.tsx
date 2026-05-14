// components/Mascots.web.tsx — web variant of Mascots.tsx.
// Soli stuff is identical (react-native-web handles Image + Reanimated).
// Rive components use @rive-app/react-canvas instead of @rive-app/react-native.
import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Rive from '@rive-app/react-canvas';
import { Typography, Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

// ── Soli avatar ───────────────────────────────────────────────────────────
export type SoliState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';

interface SoliAvatarProps {
  size?: number;
  state?: SoliState;
}

const SOLI_IMAGES = {
  idle: require('@/assets/mascot/soli_idle.png'),
  watching: require('@/assets/mascot/soli_watching.png'),
  celebrate: require('@/assets/mascot/soli_celebrate.png'),
  nudge: require('@/assets/mascot/soli_nudge.png'),
  alert: require('@/assets/mascot/soli_watching.png'),
};

export function SoliAvatar({ size = 48, state = 'watching' }: SoliAvatarProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(translateY);
    cancelAnimation(translateX);
    cancelAnimation(rotate);

    translateX.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(0, { duration: 150 });
    rotate.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(1, { duration: 150 });

    if (state === 'celebrate') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 220, easing: Easing.out(Easing.quad) }),
          withTiming(0.92, { duration: 140, easing: Easing.in(Easing.quad) }),
          withTiming(1.0, { duration: 200 }),
          withTiming(1.0, { duration: 300 }),
        ),
        3,
        false
      );
      translateY.value = withRepeat(
        withSequence(
          withTiming(-14, { duration: 220, easing: Easing.out(Easing.quad) }),
          withTiming(3, { duration: 140, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 300 }),
        ),
        3,
        false
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(-7, { duration: 200 }),
          withTiming(7, { duration: 280 }),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 80 }),
        ),
        3,
        false
      );
    } else if (state === 'nudge') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.07, { duration: 350, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 350, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true
      );
      translateX.value = withRepeat(
        withSequence(
          withTiming(-7, { duration: 70 }),
          withTiming(7, { duration: 70 }),
          withTiming(-5, { duration: 70 }),
          withTiming(5, { duration: 70 }),
          withTiming(0, { duration: 70 }),
          withTiming(0, { duration: 1400 }),
        ),
        -1,
        false
      );
    } else if (state === 'alert') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 220, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 220, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true
      );
      translateX.value = withRepeat(
        withSequence(
          withTiming(-9, { duration: 55 }),
          withTiming(9, { duration: 55 }),
          withTiming(-7, { duration: 55 }),
          withTiming(7, { duration: 55 }),
          withTiming(-5, { duration: 55 }),
          withTiming(5, { duration: 55 }),
          withTiming(0, { duration: 55 }),
          withTiming(0, { duration: 900 }),
        ),
        -1,
        false
      );
    } else if (state === 'watching') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false
      );
    } else {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false
      );
    }
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[soliStyles.avatarWrap, { width: size, height: size }, animStyle]}>
      <Image
        source={SOLI_IMAGES[state]}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// ── Soli message overlay ──────────────────────────────────────────────────
interface SoliOverlayProps {
  soliState: SoliState;
  message: string;
  onDismiss?: () => void;
}

export function SoliOverlay({ soliState, message, onDismiss }: SoliOverlayProps) {
  const C = useThemeColors();
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  const stateBg: Record<SoliState, string> = {
    idle:      C.bgCard,
    watching:  C.bgCard,
    nudge:     'rgba(251,191,36,0.08)',
    alert:     'rgba(248,113,113,0.08)',
    celebrate: 'rgba(74,222,128,0.08)',
  };

  const stateBorder: Record<SoliState, string> = {
    idle:      C.border,
    watching:  C.border,
    nudge:     'rgba(251,191,36,0.25)',
    alert:     'rgba(248,113,113,0.3)',
    celebrate: 'rgba(74,222,128,0.3)',
  };

  const stateNameColor: Record<SoliState, string> = {
    idle:      C.purple,
    watching:  C.purple,
    nudge:     C.amber,
    alert:     '#f87171',
    celebrate: C.green,
  };

  useEffect(() => {
    if (soliState !== 'idle') {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(10, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [soliState]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (soliState === 'idle') return null;

  return (
    <Animated.View
      style={[
        soliStyles.overlayContainer,
        {
          backgroundColor: stateBg[soliState],
          borderColor: stateBorder[soliState],
        },
        animStyle,
      ]}
    >
      <SoliAvatar size={40} state={soliState} />
      <View style={soliStyles.overlayTextWrap}>
        <Text style={[soliStyles.overlayName, { color: stateNameColor[soliState] }]}>Soli</Text>
        <Text style={[soliStyles.overlayMessage, { color: C.textSecondary }]} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={[soliStyles.overlayDismiss, { color: C.textTertiary }]}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

// ── Rive assets ───────────────────────────────────────────────────────────
const toviAsset = require('../assets/rive/tovi.riv');
const iconSetAsset = require('../assets/rive/interactive-icon-set.riv');

// ── Tovi rive avatar ──────────────────────────────────────────────────────
interface ToviAvatarProps {
  size?: number;
}

export function ToviAvatar({ size = 160 }: ToviAvatarProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Rive src={toviAsset} autoplay style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Rive section (large tovi scene) ───────────────────────────────────────
export function RiveSection() {
  return (
    <div style={{ width: '100%', height: 600, marginBottom: 20 }}>
      <Rive src={toviAsset} autoplay={true} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Interactive icon set ──────────────────────────────────────────────────
interface RiveIconSetProps {
  size?: number;
  artboardName?: string;
  stateMachineName?: string;
}

export function RiveIconSet({
  size = 160,
  artboardName,
  stateMachineName = 'State Machine 1',
}: RiveIconSetProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Rive
        src={iconSetAsset}
        artboard={artboardName}
        stateMachines={stateMachineName}
        autoplay
      />
    </div>
  );
}

const soliStyles = StyleSheet.create({
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 0.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  overlayTextWrap: {
    flex: 1,
  },
  overlayName: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  overlayMessage: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    lineHeight: 18,
  },
  overlayDismiss: {
    fontSize: 12,
    paddingLeft: 4,
  },
});
