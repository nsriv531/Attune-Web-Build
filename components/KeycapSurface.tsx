import React, { useState } from 'react';
import { View, Pressable, ViewStyle, StyleSheet, Platform } from 'react-native';
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
 * Flat 2D card surface — non-interactive. No depth, no shadow, no shine.
 */
export function KeycapSurface({
  accent = false,
  radius = Radius.xl,
  style,
  contentStyle,
  children,
}: KeycapSurfaceProps) {
  const faceColor = accent ? Colors.amber : Colors.bgCard;
  const borderColor = accent ? Colors.amberBorder : Colors.border;

  return (
    <View
      style={[
        {
          backgroundColor: faceColor,
          borderRadius: radius,
          borderColor,
          borderWidth: 1,
        },
        contentStyle,
        style,
      ]}
    >
      {children}
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

const webTransition: ViewStyle = Platform.OS === 'web'
  ? ({
      // @ts-expect-error — react-native-web supports CSS transition props
      transitionProperty: 'box-shadow, background-color',
      transitionDuration: '180ms',
      transitionTimingFunction: 'ease-out',
    } as ViewStyle)
  : {};

const webShineTransition: ViewStyle = Platform.OS === 'web'
  ? ({
      // @ts-expect-error — react-native-web supports CSS transition props
      transitionProperty: 'opacity',
      transitionDuration: '180ms',
      transitionTimingFunction: 'ease-out',
    } as ViewStyle)
  : {};

/**
 * Pressable 3D keycap button. At rest it shows shadow + depth ledge + shine.
 * On press, all three 3D affordances vanish and the button reads as a flat
 * 2D shape in the same physical position (no translate, no "press-into" feel).
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

  const [pressed, setPressed] = useState(false);

  return (
    <View
      style={[
        styles.depthWrapper,
        {
          // When pressed, the ledge collapses visually by matching the face color
          backgroundColor: pressed ? faceColor : depthColor,
          borderRadius: radius,
          borderColor,
          borderWidth: 1,
          // RN's shadow props — react-native-web compiles these to a single box-shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: pressed ? 0 : 0.08,
          shadowRadius: 10,
          elevation: pressed ? 0 : 2,
        },
        webTransition,
        style,
      ]}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={disabled ? undefined : () => setPressed(true)}
        onPressOut={disabled ? undefined : () => setPressed(false)}
        style={{ borderRadius: radius - 1 }}
        android_ripple={null}
      >
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
          <View
            style={[
              styles.shine,
              {
                backgroundColor: highlight,
                borderTopLeftRadius: radius - 1,
                borderTopRightRadius: radius - 1,
                opacity: pressed ? 0 : 1,
                pointerEvents: 'none',
              },
              webShineTransition,
            ]}
          />
          {children}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  depthWrapper: {
    // paddingBottom: 3 creates the visible "key depth" ledge at rest.
    // When pressed, the wrapper's background matches the face so the ledge
    // is no longer visible — collapsing the 3D affordance.
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
