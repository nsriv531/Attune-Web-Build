import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Typography, Spacing, Colors, Radius } from '@/constants/theme';

interface TopAppBarProps {
  userName?: string;
  userImage?: string;
  onNotifications?: () => void;
  onProfile?: () => void;
}

function WavesIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 9.5c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Path
        d="M2 14.5c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function TopAppBar({
  userName = 'User',
  onNotifications,
  onProfile,
}: TopAppBarProps) {
  // Wave float animation — perpetual gentle up/down on the logo icon
  const waveY = useSharedValue(0);
  useEffect(() => {
    waveY.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: waveY.value }],
  }));

  const initial = userName ? userName[0].toUpperCase() : 'U';

  return (
    <View style={styles.container}>
      {/* Logo + app name */}
      <View style={styles.leftSection}>
        <Animated.View style={waveStyle}>
          <WavesIcon color={Colors.amber} />
        </Animated.View>
        <Text style={styles.logo}>Attune</Text>
      </View>

      <View style={styles.rightSection}>
        {/* Bell — cream keycap button */}
        <Pressable onPress={onNotifications}>
          <View style={[styles.iconKeycap, styles.keycapDepth]}>
            <View style={[styles.keycapFace, styles.keycapCream]}>
              <View style={styles.keycapShine} />
              <BellIcon color={Colors.textTertiary} />
            </View>
          </View>
        </Pressable>

        {/* Avatar initial — amber keycap button */}
        <Pressable onPress={onProfile}>
          <View style={[styles.iconKeycap, styles.keycapAccentDepth]}>
            <View style={[styles.keycapFace, styles.keycapAmber]}>
              <View style={[styles.keycapShine, styles.keycapAccentShine]} />
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const KEYCAP_SIZE = 34;
const KEYCAP_RADIUS = 12;

const keycapShadow = Platform.OS === 'ios'
  ? { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 6 }
  : { elevation: 2 };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: 'transparent',
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  logo: {
    fontFamily: Typography.fontSans,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: Colors.textPrimary,
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  // Keycap button structure
  iconKeycap: {
    width: KEYCAP_SIZE,
    height: KEYCAP_SIZE,
    borderRadius: KEYCAP_RADIUS,
    paddingBottom: 3,
    borderWidth: 1,
    ...keycapShadow,
  },
  keycapDepth: {
    backgroundColor: Colors.keycapDepthColor,
    borderColor: Colors.border,
  },
  keycapAccentDepth: {
    backgroundColor: Colors.keycapAccentDepthColor,
    borderColor: Colors.amberBorder,
  },
  keycapFace: {
    flex: 1,
    borderRadius: KEYCAP_RADIUS - 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  keycapCream: {
    backgroundColor: Colors.bgCard,
  },
  keycapAmber: {
    backgroundColor: Colors.amber,
  },
  keycapShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.keycapHighlight,
    borderTopLeftRadius: KEYCAP_RADIUS - 1,
    borderTopRightRadius: KEYCAP_RADIUS - 1,
  },
  keycapAccentShine: {
    backgroundColor: Colors.keycapAccentHighlight,
  },

  avatarText: {
    fontFamily: Typography.fontSans,
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2000',
  },
});
