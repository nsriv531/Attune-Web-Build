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
        d="M2 7c2 0 3-3 5-3s3 3 5 3 3-3 5-3 3 3 5 3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 12c2 0 3-3 5-3s3 3 5 3 3-3 5-3 3 3 5 3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 17c2 0 3-3 5-3s3 3 5 3 3-3 5-3 3 3 5 3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c0 0-5 2-5 7v4l-2 3h14l-2-3v-4c0-5-5-7-5-7z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 19h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
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
        <WavesIcon color={C.amber} />
        <Text style={[styles.logo, { color: C.textPrimary }]}>Attune</Text>
      </View>

      <View style={styles.rightSection}>
        <Pressable onPress={onNotifications} style={styles.iconButton}>
          <BellIcon color={C.textSecondary} />
        </Pressable>

        <Pressable onPress={onProfile}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: '#F5E6D3',
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: '#8C6B4A' }]}>{userName[0]}</Text>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});
