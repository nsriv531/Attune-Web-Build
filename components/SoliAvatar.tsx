import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

export type SoliState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';

interface SoliAvatarProps {
  size?: number;
  state?: SoliState;
}

const IMAGES = {
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

    // Smoothly return non-state values to neutral before new animation
    translateX.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(0, { duration: 150 });
    rotate.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(1, { duration: 150 });

    if (state === 'celebrate') {
      // Jump with squash-and-stretch and a playful tilt
      scale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 220, easing: Easing.out(Easing.quad) }),
          withTiming(0.92, { duration: 140, easing: Easing.in(Easing.quad) }),
          withTiming(1.0, { duration: 200 }),
          withTiming(1.0, { duration: 300 }), // brief pause between jumps
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
      // Periodic attention-seeking shake with a pause between bursts
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
          withTiming(0, { duration: 1400 }), // pause before next burst
        ),
        -1,
        false
      );
    } else if (state === 'alert') {
      // Faster, more intense shake
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
      // Gentle floating bob — alive and present
      translateY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false
      );
    } else {
      // idle: slow breathing scale
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
    <Animated.View style={[styles.wrap, { width: size, height: size }, animStyle]}>
      <Image
        source={IMAGES[state]}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
