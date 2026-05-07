import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout, CTAButton } from '@/components/OnboardingLayout';
import { useOnboardingStore } from '@/backend/stores/onboardingStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

function PermissionRow({
  icon,
  title,
  description,
  granted,
  onAllow,
}: {
  icon: string;
  title: string;
  description: string;
  granted: boolean;
  onAllow: () => void;
}) {
  return (
    <View style={[styles.permRow, granted && styles.permRowGranted]}>
      <Text style={styles.permIcon}>{icon}</Text>
      <View style={styles.permText}>
        <Text style={styles.permTitle}>{title}</Text>
        <Text style={styles.permDesc}>{description}</Text>
      </View>
      {granted ? (
        <View style={styles.grantedBadge}>
          <Text style={styles.grantedText}>On</Text>
        </View>
      ) : (
        <Pressable onPress={onAllow} style={styles.allowBtn}>
          <Text style={styles.allowText}>Allow</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function PermissionsScreen() {
  const router = useRouter();
  const [notifGranted, setNotifGranted] = useState(false);
  const [screenTimeGranted, setScreenTimeGranted] = useState(false);

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(12);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    contentY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  async function handleAllowNotifications() {
    // In production: call expo-notifications requestPermissionsAsync()
    setNotifGranted(true);
  }

  function handleAllowScreenTime() {
    // In production: trigger screen time access request
    setScreenTimeGranted(true);
  }

  function handleContinue() {
    router.push('/onboarding/pre-session' as never);
  }

  return (
    <OnboardingLayout step={12}>
      <Animated.View style={[styles.container, contentStyle]}>
        <View style={styles.header}>
          <Text style={styles.headline}>Two quick asks.</Text>
          <Text style={styles.subline}>
            Both make Sage meaningfully better. Neither is required to continue.
          </Text>
        </View>

        <View style={styles.perms}>
          <PermissionRow
            icon="🔔"
            title="Notifications"
            description="So Sage can find you tomorrow at your best time."
            granted={notifGranted}
            onAllow={handleAllowNotifications}
          />
          <PermissionRow
            icon="🛡"
            title="Screen time access"
            description={`So Sage can tell when you've drifted to another app. Sage never reads what's on your screen — just whether Attune is in front.`}
            granted={screenTimeGranted}
            onAllow={handleAllowScreenTime}
          />
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton label="Continue" onPress={handleContinue} />
          <Pressable style={styles.laterBtn} onPress={handleContinue}>
            <Text style={styles.laterText}>Maybe later</Text>
          </Pressable>
        </View>
      </Animated.View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
  },
  headline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  subline: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  perms: {
    gap: Spacing.md,
    flex: 1,
  },
  permRow: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  permRowGranted: {
    borderColor: 'rgba(74,222,128,0.3)',
    backgroundColor: 'rgba(74,222,128,0.04)',
  },
  permIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  permText: {
    flex: 1,
    gap: Spacing.xs,
  },
  permTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  permDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  grantedBadge: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(74,222,128,0.4)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  grantedText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.green,
    letterSpacing: 0.3,
  },
  allowBtn: {
    backgroundColor: Colors.purpleDim,
    borderWidth: 0.5,
    borderColor: Colors.purpleBorder,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  allowText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.purple,
  },
  ctaWrap: {
    paddingBottom: Spacing['2xl'],
    gap: Spacing.xs,
  },
  laterBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  laterText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textHint,
  },
});
