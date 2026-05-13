// app/(tabs)/_layout.tsx
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Typography, Colors, Radius } from '@/constants/theme';

const ACTIVE_COLOR = Colors.amberDark;     // bolder amber for icon/text
const ACTIVE_BG = Colors.amberDim;          // soft amber tint behind active tab
const ACTIVE_BORDER = Colors.amberBorder;   // amber outline

function IconHome({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M9 21V12h6v9" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

function IconSession({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={2} />
      <Path d="M12 9v4l2.5 2.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M9 2h6M12 2v3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function IconProgress({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3v18h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M7 16l4-5 4 3 4-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconResources({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h7a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H4V4z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M20 4h-7a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5H20V4z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconSettings({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

// Flat pressable with a soft press-feedback animation.
function FlatTabButton({
  children,
  onPress,
  onLongPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
}: any) {
  const press = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.94], Extrapolation.CLAMP) }],
    opacity: interpolate(press.value, [0, 1], [1, 0.85], Extrapolation.CLAMP),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => { press.value = withTiming(1, { duration: 90 }); }}
      onPressOut={() => { press.value = withSpring(0, { damping: 14, stiffness: 260 }); }}
      style={styles.tabPressable}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.tabPressableInner, animStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Animated pill behind the icon + icon scale bump when activated.
function TabIcon({
  Icon,
  isActive,
}: {
  Icon: React.ComponentType<{ color: string }>;
  isActive: boolean;
}) {
  const active = useSharedValue(isActive ? 1 : 0);
  const iconBump = useSharedValue(1);

  useEffect(() => {
    active.value = withSpring(isActive ? 1 : 0, { damping: 16, stiffness: 220, mass: 0.6 });
    if (isActive) {
      iconBump.value = withSequence(
        withTiming(1.18, { duration: 140 }),
        withSpring(1, { damping: 10, stiffness: 280 }),
      );
    }
  }, [isActive, active, iconBump]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: active.value,
    transform: [
      { scale: interpolate(active.value, [0, 1], [0.7, 1], Extrapolation.CLAMP) },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconBump.value }],
  }));

  return (
    <View style={styles.iconWrap}>
      <Animated.View style={[styles.activePill, pillStyle]} pointerEvents="none" />
      <Animated.View style={iconStyle}>
        <Icon color={isActive ? ACTIVE_COLOR : Colors.textTertiary} />
      </Animated.View>
    </View>
  );
}

// Custom label so we can tween color/weight smoothly across the active state.
function TabLabel({ label, isActive }: { label: string; isActive: boolean }) {
  return (
    <Text
      style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        linking: undefined,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIconStyle,
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, React.ComponentType<{ color: string }>> = {
            index: IconHome,
            session: IconSession,
            insights: IconProgress,
            resources: IconResources,
            profile: IconSettings,
          };
          const IconComp = icons[route.name] || IconHome;
          return <TabIcon Icon={IconComp} isActive={focused} />;
        },
        tabBarLabel: ({ focused, children }) => (
          <TabLabel label={String(children)} isActive={focused} />
        ),
        tabBarButton: (props) => <FlatTabButton {...props} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Focus' }} />
      <Tabs.Screen name="session" options={{ title: 'Sessions', href: null }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="resources" options={{ title: 'Resources' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const TAB_BAR_HEIGHT = Platform.select({ ios: 82, android: 68, default: 64 });
const TAB_BAR_PADDING_BOTTOM = Platform.select({ ios: 22, android: 10, default: 10 });

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg,
    borderTopColor: Colors.amberBorder,
    borderTopWidth: 1,
    height: TAB_BAR_HEIGHT,
    paddingBottom: TAB_BAR_PADDING_BOTTOM,
    paddingTop: 8,
    paddingHorizontal: 4,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none', cursor: 'pointer' } as any)
      : null),
  },
  tabPressableInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: '100%',
  },
  tabItem: {
    paddingVertical: 0,
  },
  tabIconStyle: {
    marginTop: 0,
    marginBottom: 0,
  },
  iconWrap: {
    width: 48,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.md,
    backgroundColor: ACTIVE_BG,
    borderWidth: 1.5,
    borderColor: ACTIVE_BORDER,
  },
  tabLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  tabLabelInactive: {
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '800',
  },
});
