import React, { useRef } from 'react';
import { View, Pressable, ViewStyle, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Radius } from '@/constants/theme';

interface KeycapSurfaceProps {
  /** Use amber accent keycap instead of cream */
  accent?: boolean;
  /** Border radius of the keycap */
  radius?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * Static keycap card surface — provides the 3D depth illusion
 * without any press interaction. Use for non-interactive cards.
 */
export function KeycapSurface({
  accent = false,
  radius = Radius.xl,
  style,
  contentStyle,
  children,
}: KeycapSurfaceProps) {
  const depthColor = accent ? Colors.keycapAccentDepthColor : Colors.keycapDepthColor;
  const faceColor = accent ? Colors.amber : Colors.bgCard;
  const highlight = accent ? Colors.keycapAccentHighlight : Colors.keycapHighlight;
  const borderColor = accent ? Colors.amberBorder : Colors.border;

  return (
    <View
      style={[
        styles.depthWrapper,
        {
          backgroundColor: depthColor,
          borderRadius: radius,
          borderColor,
          borderWidth: 1,
        },
        // Ambient shadow
        Platform.OS === 'ios'
          ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 }
          : { elevation: 2 },
        style,
      ]}
    >
      {/* Keycap face */}
      <View
        style={[
          styles.face,
          {
            backgroundColor: faceColor,
            borderRadius: radius - 1,
          },
          contentStyle,
        ]}
      >
        {/* Top shine strip */}
        <View
          style={[
            styles.shine,
            {
              backgroundColor: highlight,
              borderTopLeftRadius: radius - 1,
              borderTopRightRadius: radius - 1,
            },
          ]}
          pointerEvents="none"
        />
        {children}
      </View>
    </View>
  );
}

interface KeycapButtonProps {
  /** Use amber accent keycap instead of cream */
  accent?: boolean;
  radius?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Pressable keycap button with tactile depth physics.
 * translateY(3) on press to simulate the key traveling down,
 * reducing the visible depth gap from 3px → 0px.
 */
export function KeycapButton({
  accent = false,
  radius = Radius.xl,
  style,
  contentStyle,
  onPress,
  onLongPress,
  disabled = false,
  children,
}: KeycapButtonProps) {
  const depthColor = accent
    ? disabled ? Colors.keycapDepthColor : Colors.keycapAccentDepthColor
    : Colors.keycapDepthColor;
  const faceColor = accent
    ? disabled ? Colors.bgCardHigh : Colors.amber
    : Colors.bgCard;
  const highlight = accent && !disabled ? Colors.keycapAccentHighlight : Colors.keycapHighlight;
  const borderColor = accent && !disabled ? Colors.amberBorder : Colors.border;

  const pressAnim = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressAnim.value }],
  }));

  function handlePressIn() {
    pressAnim.value = withTiming(3, { duration: 80 });
  }

  function handlePressOut() {
    pressAnim.value = withSpring(0, { damping: 12, stiffness: 300 });
  }

  return (
    <View
      style={[
        styles.depthWrapper,
        {
          backgroundColor: depthColor,
          borderRadius: radius,
          borderColor,
          borderWidth: 1,
        },
        Platform.OS === 'ios'
          ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 }
          : { elevation: 2 },
        style,
      ]}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        style={{ borderRadius: radius - 1 }}
        android_ripple={null}
      >
        <Animated.View
          style={[
            styles.face,
            {
              backgroundColor: faceColor,
              borderRadius: radius - 1,
            },
            contentStyle,
            animStyle,
          ]}
        >
          {/* Top shine strip */}
          <View
            style={[
              styles.shine,
              {
                backgroundColor: highlight,
                borderTopLeftRadius: radius - 1,
                borderTopRightRadius: radius - 1,
              },
            ]}
            pointerEvents="none"
          />
          {children}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  depthWrapper: {
    // paddingBottom: 3 creates the visible "key depth" — the darker wrapper
    // shows 3px below the face, simulating a keycap stem
    paddingBottom: 3,
  },
  face: {
    overflow: 'hidden',
    position: 'relative',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
  },
});
