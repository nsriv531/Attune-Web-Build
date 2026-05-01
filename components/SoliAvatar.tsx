import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
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
  alert: require('@/assets/mascot/soli_watching.png'), // Using watching as fallback for alert
};

export function SoliAvatar({ size = 48, state = 'watching' }: SoliAvatarProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (state === 'celebrate') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 400 }),
          withTiming(1.0, { duration: 300 })
        ),
        3,
        false
      );
    } else if (state === 'nudge' || state === 'alert') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1.0, { duration: 500 })
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
