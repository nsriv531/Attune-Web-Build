// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Typography, Colors } from '@/constants/theme';

function IconHome({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M9 21V12h6v9" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IconSession({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={1.8} />
      <Path d="M12 9v4l2.5 2.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M9 2h6M12 2v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function IconProgress({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3v18h18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M7 16l4-5 4 3 4-7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconResources({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h7a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H4V4z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M20 4h-7a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5H20V4z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconSettings({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

// Pressable tab button with keycap press physics
function KeycapTabButton({ children, onPress, onLongPress, style, accessibilityRole, accessibilityState, accessibilityLabel }: any) {
  const pressAnim = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressAnim.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => { pressAnim.value = withTiming(3, { duration: 80 }); }}
      onPressOut={() => { pressAnim.value = withSpring(0, { damping: 12, stiffness: 300 }); }}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Custom tab bar icon wrapper with keycap depth effect for the active state
function TabIcon({ Icon, color, isActive }: { Icon: React.ComponentType<{ color: string }>; color: string; isActive: boolean }) {
  if (!isActive) {
    return (
      <View style={[styles.tabKeycapDepth, styles.tabKeycapCreamDepth]}>
        <View style={[styles.tabKeycapFace, styles.tabKeycapCream]}>
          <View style={[styles.tabKeycapShine, styles.tabKeycapCreamShine]} />
          <Icon color={color} />
        </View>
      </View>
    );
  }
  // Active: amber keycap effect
  return (
    <View style={[styles.tabKeycapDepth, styles.tabKeycapAccentDepth]}>
      <View style={[styles.tabKeycapFace, styles.tabKeycapAmber]}>
        <View style={[styles.tabKeycapShine, styles.tabKeycapAccentShine]} />
        <Icon color="#2C2000" />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        linking: undefined,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2C2000',
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, React.ComponentType<{ color: string }>> = {
            index: IconHome,
            session: IconSession,
            insights: IconProgress,
            resources: IconResources,
            profile: IconSettings,
          };
          const IconComp = icons[route.name] || IconHome;
          return <TabIcon Icon={IconComp} color={color} isActive={focused} />;
        },
        tabBarButton: (props) => <KeycapTabButton {...props} />,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Focus' }}
      />
      <Tabs.Screen
        name="session"
        options={{ title: 'Sessions', href: null }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights' }}
      />
      <Tabs.Screen
        name="resources"
        options={{ title: 'Resources' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}

const tabBarShadow = Platform.OS === 'ios'
  ? { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.04, shadowRadius: 8 }
  : { elevation: 4 };

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg,
    borderTopColor: 'rgba(175,158,128,0.28)',
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 25,
    paddingTop: 8,
    paddingHorizontal: 8,
    ...tabBarShadow,
  },
  tabLabel: {
    fontFamily: Typography.fontSans,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  tabItem: {
    paddingTop: 2,
  },

  // Inactive tab icon — cream keycap
  tabKeycapCreamDepth: {
    backgroundColor: Colors.keycapDepthColor,
    borderColor: Colors.border,
  },
  tabKeycapCream: {
    backgroundColor: Colors.bgCard,
  },
  tabKeycapCreamShine: {
    backgroundColor: Colors.keycapHighlight,
  },

  // Active tab — keycap amber button
  tabKeycapDepth: {
    borderRadius: 12,
    paddingBottom: 3,
    borderWidth: 1,
  },
  tabKeycapAccentDepth: {
    backgroundColor: Colors.keycapAccentDepthColor,
    borderColor: Colors.amberBorder,
  },
  tabKeycapFace: {
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  tabKeycapAmber: {
    backgroundColor: Colors.amber,
  },
  tabKeycapShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
  },
  tabKeycapAccentShine: {
    backgroundColor: Colors.keycapAccentHighlight,
  },
});
