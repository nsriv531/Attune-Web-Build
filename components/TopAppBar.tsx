import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Typography, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface TopAppBarProps {
  userName?: string;
  userImage?: string;
  onNotifications?: () => void;
  onProfile?: () => void;
}

function WavesIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12c0 2 1.79 4 4 4s4-2 4-4m8 0c0 2 1.79 4 4 4s4-2 4-4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c0 0-6 2-6 8v4l-2 3h16l-2-3v-4c0-6-6-8-6-8z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9.73 20h4.54" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export default function TopAppBar({
  userName = 'User',
  userImage,
  onNotifications,
  onProfile,
}: TopAppBarProps) {
  const C = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.leftSection}>
        <WavesIcon color={C.purple} />
        <Text style={[styles.logo, { color: C.textPrimary }]}>Attune</Text>
      </View>

      <View style={styles.rightSection}>
        <Pressable onPress={onNotifications} style={styles.iconButton}>
          <BellIcon color={C.textTertiary} />
        </Pressable>

        <Pressable onPress={onProfile}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: C.purple,
                borderColor: `${C.purple}33`,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: '#fff' }]}>{userName[0]}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  logo: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  iconButton: {
    padding: Spacing.sm,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});
