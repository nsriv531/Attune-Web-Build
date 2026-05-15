import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useThemeStore } from '@/backend/stores/themeStore';
import { PALETTES, PALETTE_ORDER, type PaletteKey } from '@/constants/palettes';
import {
  useUserStore,
  getAvatarLevel,
  xpToNextLevel,
  AVATAR_LEVELS,
} from '@/backend/stores/userStore';
import { useSessionStore } from '@/backend/stores/sessionStore';
import { useAuthStore } from '@/backend/stores/authStore';
import { useAvatarCustomizationStore } from '@/backend/stores/avatarCustomizationStore';
import {
  useOnboardingStore,
  ONBOARDING_STORAGE_KEY,
} from '@/backend/stores/onboardingStore';
import { SageAvatar } from '@/components/SageAvatar';
import { AvatarCustomizationShop } from '@/components/AvatarCustomizationShop';

const UNLOCKS: Record<number, string[]> = {
  1: ['Default Sage'],
  2: ['Default Sage', 'Night Sage skin'],
  3: ['Default Sage', 'Night Sage', 'Cosmic skin'],
  4: ['Default Sage', 'Night Sage', 'Cosmic', 'Animated aura'],
  5: ['All skins', 'Animated aura', 'Custom avatar name'],
};

function getSessionMinutes(session: any) {
  if (typeof session.durationMinutes === 'number') {
    return session.durationMinutes;
  }

  if (typeof session.plannedDuration === 'number') {
    return session.plannedDuration;
  }

  if (typeof session.timeOverall === 'number') {
    return session.timeOverall / 60;
  }

  if (typeof session.actualDuration === 'number') {
    return session.actualDuration / 60;
  }

  return 0;
}

function getSessionStartedAt(session: any) {
  return session.startedAt ?? session.createdAt ?? Date.now();
}

export default function ProfileScreen() {
  const router = useRouter();
  const C = useThemeColors();

  const { paletteKey, setPalette } = useThemeStore();
  const {
    name,
    totalXp: localXp,
    streakDays: localStreakDays,
    totalSessions: localTotalSessions,
    sessions: localSessions,
    reset: resetUserStore,
  } = useUserStore();

  const { isSignedIn, signOut } = useAuth();
  const { user } = useClerk();

  const convexSessions = useQuery(api.sessions.list, isSignedIn ? { limit: 50 } : 'skip');
  const convexStats = useQuery(api.sessions.getStats, isSignedIn ? {} : 'skip');
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  const sessions = (isSignedIn ? convexSessions ?? [] : localSessions) as any[];
  const totalXp = isSignedIn ? convexStats?.totalXp ?? 0 : localXp;
  const streakDays = isSignedIn ? convexStats?.streakDays ?? 0 : localStreakDays;
  const totalSessions = isSignedIn
    ? convexStats?.totalSessions ?? 0
    : localTotalSessions;

  const { coins, reset: resetCustomization } = useAvatarCustomizationStore();
  const { isGuest, setGuest } = useAuthStore();

  const [shopVisible, setShopVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      isGuest
        ? 'Are you sure? This will permanently delete all your locally saved progress and data.'
        : 'Are you sure? This will permanently delete your account, progress, and all cloud data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              if (isSignedIn) {
                await deleteAccountMutation();
                await user?.delete();
              }
            } catch (e) {
              console.error('Error deleting remote account:', e);
            } finally {
              useUserStore.persist.clearStorage();
              useSessionStore.persist.clearStorage();
              useAuthStore.persist.clearStorage();
              await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);

              resetUserStore();
              resetCustomization();
              useOnboardingStore.getState().resetOnboardingFlag();
              setGuest(false);

              if (isSignedIn) {
                await signOut();
              }

              setIsDeleting(false);
              router.replace('/sign-in');
            }
          },
        },
      ]
    );
  };

  const levelInfo = getAvatarLevel(totalXp);
  const level = levelInfo.level;
  const levelName = levelInfo.name;

  const progressToNext = () => {
    if (level >= AVATAR_LEVELS.length) {
      return 1;
    }

    const curr = AVATAR_LEVELS[level - 1].xpRequired;
    const next = AVATAR_LEVELS[level].xpRequired;

    return (totalXp - curr) / (next - curr);
  };

  const pct = progressToNext();
  const remaining = xpToNextLevel(totalXp);

  const avgFocus =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (total: number, session: any) => total + (session.focusScore ?? 0),
            0
          ) / sessions.length
        )
      : 0;

  const totalHours =
    Math.round(
      (sessions.reduce(
        (total: number, session: any) => total + getSessionMinutes(session),
        0
      ) /
        60) *
        10
    ) / 10;

  function handleSelectPalette(key: PaletteKey) {
    setPalette(key);
    Haptics.selectionAsync();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <SageAvatar size={88} state="watching" />
          <Text style={[styles.nameText, { color: C.textPrimary }]}>{name}</Text>

          <View
            style={[
              styles.levelBadge,
              { backgroundColor: C.purpleDim, borderColor: C.purpleBorder },
            ]}
          >
            <Text style={[styles.levelBadgeText, { color: C.purple }]}>
              Level {level} · {levelName}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.customizeButton,
              { backgroundColor: C.bgCard, borderColor: C.purple },
            ]}
            onPress={() => setShopVisible(true)}
          >
            <Text style={[styles.customizeButtonText, { color: C.purple }]}>
              ✨ Customize Avatar
            </Text>

            <View style={[styles.coinBadge, { backgroundColor: C.amber }]}>
              <Text style={styles.coinBadgeText}>{coins}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.xpCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={styles.xpCardTop}>
            <Text style={[styles.xpTotal, { color: C.purple }]}>{totalXp} XP</Text>

            {remaining > 0 && (
              <Text style={[styles.xpRemaining, { color: C.textTertiary }]}>
                {remaining} XP to Level {level + 1}
              </Text>
            )}
          </View>

          <View style={[styles.xpBarTrack, { backgroundColor: C.bgInput }]}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${Math.round(pct * 100)}%`,
                  backgroundColor: C.purple,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.grid}>
          {[
            { label: 'Sessions', value: totalSessions, color: C.textPrimary },
            { label: 'Streak', value: `${streakDays}d`, color: C.amber },
            { label: 'Avg focus', value: avgFocus || '--', color: C.green },
            { label: 'Hours', value: totalHours, color: C.purple },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.gridCell,
                { backgroundColor: C.bgCard, borderColor: C.border },
              ]}
            >
              <Text style={[styles.gridNum, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.gridLbl, { color: C.textTertiary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.paletteCard,
            { backgroundColor: C.bgCard, borderColor: C.border },
          ]}
        >
          <Text style={[styles.cardLabel, { color: C.textTertiary }]}>Appearance</Text>

          <View style={styles.paletteRow}>
            {PALETTE_ORDER.map((key) => {
              const palette = PALETTES[key];
              const isActive = key === paletteKey;

              return (
                <Pressable
                  key={key}
                  style={styles.paletteItem}
                  onPress={() => handleSelectPalette(key)}
                >
                  <View
                    style={[
                      styles.paletteSwatch,
                      { backgroundColor: palette.bg },
                      isActive && {
                        borderColor: palette.swatch,
                        borderWidth: 2,
                      },
                      !isActive && {
                        borderColor: 'rgba(255,255,255,0.12)',
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.paletteAccentDot,
                        { backgroundColor: palette.swatch },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.paletteName,
                      { color: isActive ? palette.swatch : C.textTertiary },
                    ]}
                  >
                    {palette.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.unlocksCard,
            { backgroundColor: C.bgCard, borderColor: C.border },
          ]}
        >
          <Text style={[styles.cardLabel, { color: C.textTertiary }]}>Sage unlocks</Text>

          {(UNLOCKS[level] ?? []).map((unlock) => (
            <View key={unlock} style={styles.unlockRow}>
              <View style={[styles.unlockDot, { backgroundColor: C.purple }]} />
              <Text style={[styles.unlockText, { color: C.textSecondary }]}>
                {unlock}
              </Text>
            </View>
          ))}

          {level < 5 && (
            <View style={[styles.unlockRow, { opacity: 0.35 }]}>
              <View style={[styles.unlockDot, { backgroundColor: C.textHint }]} />
              <Text style={[styles.unlockText, { color: C.textSecondary }]}>
                {UNLOCKS[level + 1]?.[level]} — reach Level {level + 1}
              </Text>
            </View>
          )}
        </View>

        {sessions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
              Recent sessions
            </Text>

            {sessions.slice(0, 5).map((session: any, index: number) => {
              const minutes = Math.round(getSessionMinutes(session));
              const startedAt = getSessionStartedAt(session);
              const focusScore = session.focusScore ?? 0;

              return (
                <View
                  key={String(session._id ?? session.id ?? startedAt ?? index)}
                  style={[
                    styles.sessionRow,
                    { backgroundColor: C.bgCard, borderColor: C.border },
                  ]}
                >
                  <View style={styles.sessionLeft}>
                    <Text
                      style={[styles.sessionSubject, { color: C.textPrimary }]}
                      numberOfLines={1}
                    >
                      {session.subject || 'Unknown'}
                    </Text>

                    <Text style={[styles.sessionMeta, { color: C.textTertiary }]}>
                      {minutes}min · {new Date(startedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.sessionRight}>
                    <Text
                      style={[
                        styles.sessionScore,
                        {
                          color:
                            focusScore >= 80
                              ? C.green
                              : focusScore >= 60
                                ? C.amber
                                : C.red,
                        },
                      ]}
                    >
                      {focusScore}
                    </Text>

                    <Text style={[styles.sessionScoreLbl, { color: C.textTertiary }]}>
                      focus
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={styles.dangerZone}>
          {isSignedIn && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderColor: C.border,
                  backgroundColor: C.bgInput,
                  marginBottom: Spacing.md,
                },
              ]}
              onPress={async () => {
                await signOut();
                router.replace('/sign-in');
              }}
            >
              <Text style={[styles.actionButtonText, { color: C.textPrimary }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: C.red }]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <Text style={[styles.deleteButtonText, { color: C.red }]}>
              {isDeleting
                ? 'Deleting...'
                : isGuest
                  ? 'Delete Local Data'
                  : 'Delete Account & Data'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <AvatarCustomizationShop
        visible={shopVisible}
        onClose={() => setShopVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl },

  avatarSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  nameText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    marginTop: Spacing.sm,
  },
  levelBadge: {
    borderWidth: 0.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  levelBadgeText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
  },

  xpCard: {
    borderWidth: 0.5,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  xpCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpTotal: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
  xpRemaining: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
  xpBarTrack: {
    height: 5,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  gridCell: {
    width: '48%',
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  gridNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
  },
  gridLbl: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },

  paletteCard: {
    borderWidth: 0.5,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paletteItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  paletteSwatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteAccentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  paletteName: {
    fontFamily: Typography.fontMono,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  cardLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  unlocksCard: {
    borderWidth: 0.5,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  unlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unlockDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  unlockText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
  },

  sectionTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sessionLeft: { flex: 1 },
  sessionSubject: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    marginBottom: 2,
  },
  sessionMeta: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
  sessionRight: { alignItems: 'center' },
  sessionScore: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
  },
  sessionScoreLbl: {
    fontFamily: Typography.fontMono,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  customizeButtonText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  coinBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    minWidth: 36,
    alignItems: 'center',
  },
  coinBadgeText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: '#1a1a1a',
  },

  dangerZone: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  deleteButtonText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
});
