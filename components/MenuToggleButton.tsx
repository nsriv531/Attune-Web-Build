import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface MenuToggleButtonProps {
  onPress?: () => void;
  size?: number;
}

export function MenuToggleButton({ onPress, size = 40 }: MenuToggleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withTiming(isOpen ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [isOpen]);

  const handlePress = () => {
    setIsOpen(!isOpen);
    onPress?.();
  };

  // Animated style for rotating lines
  const topLineStyle = useAnimatedStyle(() => {
    const rotate = interpolate(animValue.value, [0, 1], [0, 45], Extrapolate.CLAMP);
    const translateY = interpolate(animValue.value, [0, 1], [0, 6], Extrapolate.CLAMP);
    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const middleLineStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animValue.value, [0, 1], [1, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  const bottomLineStyle = useAnimatedStyle(() => {
    const rotate = interpolate(animValue.value, [0, 1], [0, -45], Extrapolate.CLAMP);
    const translateY = interpolate(animValue.value, [0, 1], [0, -6], Extrapolate.CLAMP);
    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <Pressable onPress={handlePress} style={[styles.button, { width: size, height: size }]}>
      <Animated.View style={[styles.line, topLineStyle]} />
      <Animated.View style={[styles.line, middleLineStyle]} />
      <Animated.View style={[styles.line, bottomLineStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 20,
    height: 2,
    backgroundColor: Colors.textTertiary,
    borderRadius: 1,
    marginVertical: 3,
  },
});
