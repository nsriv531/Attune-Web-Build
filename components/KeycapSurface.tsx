import React, { useState } from 'react';
import { View, Pressable, ViewStyle, StyleSheet, Platform } from 'react-native';
import { Border, Colors, Radius } from '@/constants/theme';

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
  const borderColor = Colors.border;

  return (
    <View
      style={[
        {
          backgroundColor: faceColor,
          borderRadius: radius,
          borderColor,
          borderWidth: Border.width,
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

const DEPTH = 3;

const webPressTransition: ViewStyle = Platform.OS === 'web'
  ? ({
      // @ts-expect-error — react-native-web supports CSS transition props
      transitionProperty: 'margin-top, padding-bottom, box-shadow, background-color',
      transitionDuration: '110ms',
      transitionTimingFunction: 'ease-out',
    } as ViewStyle)
  : {};

/**
 * Pressable 3D keycap button. At rest it sits raised with a shadow + a depth
 * ledge at the bottom. On press, the body's top edge slides down by DEPTH and
 * the ledge collapses to zero — the key compresses in height (top moves down,
 * bottom stays put) and reads as 2D. An outer wrapper reserves the resting
 * height so surrounding layout doesn't shift.
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
  const borderColor = Colors.border;

  const [pressed, setPressed] = useState(false);

  return (
    <View style={style}>
      <View
        style={[
          {
            marginTop: pressed ? DEPTH : 0,
            paddingBottom: pressed ? 0 : DEPTH,
            backgroundColor: pressed ? faceColor : depthColor,
            borderRadius: radius,
            borderColor,
            borderWidth: Border.width,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: pressed ? 0 : 4 },
            shadowOpacity: pressed ? 0 : 0.08,
            shadowRadius: 10,
            elevation: pressed ? 0 : 2,
          },
          webPressTransition,
        ]}
      >
        <Pressable
          onPress={disabled ? undefined : onPress}
          onLongPress={disabled ? undefined : onLongPress}
          onPressIn={disabled ? undefined : () => setPressed(true)}
          onPressOut={disabled ? undefined : () => setPressed(false)}
          style={{ borderRadius: radius - Border.width }}
          android_ripple={null}
        >
          <View
            style={[
              styles.face,
              {
                backgroundColor: faceColor,
                borderRadius: radius - Border.width,
              },
              contentStyle,
            ]}
          >
            {children}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    overflow: 'hidden',
    position: 'relative',
  },
});
