import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Typography, Spacing, Radius, Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useThemeStore } from '@/stores/themeStore';
import { PALETTES, PALETTE_ORDER, type PaletteKey } from '@/constants/palettes';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';
import { useAvatarCustomizationStore } from '@/stores/avatarCustomizationStore';
import { useOnboardingStore, ONBOARDING_STORAGE_KEY } from '@/stores/onboardingStore';
import { SoliAvatar } from '@/components/SoliAvatar';
import { AvatarCustomizationShop } from '@/components/AvatarCustomizationShop';
import { KeycapSurface, KeycapButton } from '@/components/KeycapSurface';

const LEVEL_NAMES = ['Seedling', 'Sprout', 'Scholar', 'Focus Pro', 'Sage'];
const LEVEL_XP = [0, 200, 500, 1000, 2000];
const UNLOCKS: Record<number, string[]> = {
  1: ['Default Sage'],
  2: ['Default Sage', 'Night Sage skin'],
  3: ['Default Sage', 'Night Sage', 'Cosmic skin'],
  4: ['Default Sage', 'Night Sage', 'Cosmic', 'Animated aura'],
  5: ['All skins', 'Animated aura', 'Custom avatar name'],
};

function getLevel(xp: number) {
  let lvl = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lvl = i + 1;
  }
  return lvl;
}

function progressToNext(xp: number) {
  const lvl = getLevel(xp);
  if (lvl >= LEVEL_NAMES.length) return 1;
  const curr = LEVEL_XP[lvl - 1];
  const next = LEVEL_XP[lvl];
  return (xp - curr) / (next - curr);
}

function xpToNext(xp: number) {
  const lvl = getLevel(xp);
  if (lvl >= LEVEL_NAMES.length) return 0;
  return LEVEL_XP[lvl] - xp;
}

interface ProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSidebar({ visible, onClose }: ProfileSidebarProps) {
  const C = useThemeColors();
  const router = useRouter();
  const { paletteKey, setPalette } = useThemeStore();
  const { name, totalXp, streakDays, totalSessions, sessions, reset: resetUserStore } = useUserStore();
  const { loadFromStorage, coins, reset: resetCustomization } = useAvatarCustomizationStore();
  const { isGuest, setGuest } = useAuthStore();
  const { signOut, isSignedIn } = useAuth();
  const { user } = useClerk();
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  const [shopVisible, setShopVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Sidebar animation
  const translateX = useSharedValue(-280);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      translateX.value = withTiming(-280, { duration: 400, easing: Easing.in(Easing.cubic) });
    }
  }, [visible]);

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    loadFromStorage();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account & Data",
      isGuest
        ? "Are you sure? This will permanently delete all your locally saved progress and data."
        : "Are you sure? This will permanently delete your account, progress, and all cloud data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              if (isSignedIn) {
                await deleteAccountMutation();
                await user?.delete();
              }
            } catch (e) {
              console.error("Error deleting remote account:", e);
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
          }
        }
      ]
    );
  };

  const level = getLevel(totalXp);
  const levelName = LEVEL_NAMES[level - 1];
  const pct = progressToNext(totalXp);
  const remaining = xpToNext(totalXp);

  const avgFocus =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, s) => a + s.focusScore, 0) / sessions.length)
      : 0;

  const totalHours = Math.round((sessions.reduce((a, s) => a + s.durationMinutes, 0) / 60) * 10) / 10;

  function handleSelectPalette(key: PaletteKey) {
    setPalette(key);
    Haptics.selectionAsync();
  }

  return (
    <>
      {/* Backdrop overlay */}
      {visible && (
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={0.3}
        />
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, sidebarStyle]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            {/* ── Avatar + identity ── */}
            <View style={styles.avatarSection}>
              <SoliAvatar size={88} state="watching" />
              <Text style={[styles.nameText, { color: C.textPrimary }]}>{name}</Text>
              <View style={[styles.levelBadge, { backgroundColor: C.purpleDim, borderColor: C.purpleBorder }]}>
                <Text style={[styles.levelBadgeText, { color: C.purple }]}>Level {level} · {levelName}</Text>
              </View>

              {/* Customization Button */}
              <KeycapButton
                radius={Radius.lg}
                style={styles.customizeBtnOuter}
                contentStyle={styles.customizeBtnFace}
                onPress={() => setShopVisible(true)}
              >
                <Text style={[styles.customizeButtonText, { color: C.purple }]}>
                  ✨ Customize Avatar
                </Text>
                <View style={[styles.coinBadge, { backgroundColor: C.amber }]}>
                  <Text style={styles.coinBadgeText}>{coins}</Text>
                </View>
              </KeycapButton>
            </View>

            {/* ── XP progress bar ── */}
            <KeycapSurface radius={Radius.xl} style={styles.xpCardOuter} contentStyle={styles.xpCardFace}>
              <View style={styles.xpCardTop}>
                <Text style={[styles.xpTotal, { color: C.purple }]}>{totalXp} XP</Text>
                {remaining > 0 && (
                  <Text style={[styles.xpRemaining, { color: C.textTertiary }]}>{remaining} XP to Level {level + 1}</Text>
                )}
              </View>
              <View style={[styles.xpBarTrack, { backgroundColor: C.bgInput }]}>
                <View style={[styles.xpBarFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: C.purple }]} />
              </View>
            </KeycapSurface>

            {/* ── Stats grid ── */}
            <View style={styles.grid}>
              {[
                { label: 'Sessions', value: totalSessions, color: C.textPrimary },
                { label: 'Streak', value: `${streakDays}d`, color: C.amber },
                { label: 'Avg focus', value: avgFocus || '--', color: C.green },
                { label: 'Hours', value: totalHours, color: C.purple },
              ].map((s) => (
                <KeycapSurface
                  key={s.label}
                  radius={Radius.lg}
                  style={styles.gridCellOuter}
                  contentStyle={styles.gridCellFace}
                >
                  <Text style={[styles.gridNum, { color: s.color }]}>{s.value}</Text>
                  <Text style={[styles.gridLbl, { color: C.textTertiary }]}>{s.label}</Text>
                </KeycapSurface>
              ))}
            </View>

            {/* ── Theme palette selector ── */}
            <KeycapSurface radius={Radius.xl} style={styles.paletteCardOuter} contentStyle={styles.paletteCardFace}>
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
                          isActive && { borderColor: palette.swatch, borderWidth: 2 },
                          !isActive && { borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1 },
                        ]}
                      >
                        <View style={[styles.paletteAccentDot, { backgroundColor: palette.swatch }]} />
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
            </KeycapSurface>

            {/* ── Unlocks ── */}
            <KeycapSurface radius={Radius.xl} style={styles.unlocksCardOuter} contentStyle={styles.unlocksCardFace}>
              <Text style={[styles.cardLabel, { color: C.textTertiary }]}>Sage unlocks</Text>
              {(UNLOCKS[level] ?? []).map((u) => (
                <View key={u} style={styles.unlockRow}>
                  <View style={[styles.unlockDot, { backgroundColor: C.purple }]} />
                  <Text style={[styles.unlockText, { color: C.textSecondary }]}>{u}</Text>
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
            </KeycapSurface>

            {/* ── Recent sessions ── */}
            {sessions.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Recent sessions</Text>
                {sessions.slice(0, 5).map((s) => (
                  <KeycapSurface
                    key={s.id}
                    radius={Radius.lg}
                    style={styles.sessionRowOuter}
                    contentStyle={styles.sessionRowFace}
                  >
                    <View style={styles.sessionLeft}>
                      <Text style={[styles.sessionSubject, { color: C.textPrimary }]} numberOfLines={1}>{s.subject}</Text>
                      <Text style={[styles.sessionMeta, { color: C.textTertiary }]}>
                        {s.durationMinutes}min · {new Date(s.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.sessionRight}>
                      <Text style={[styles.sessionScore, {
                        color: s.focusScore >= 80 ? C.green : s.focusScore >= 60 ? C.amber : C.red
                      }]}>
                        {s.focusScore}
                      </Text>
                      <Text style={[styles.sessionScoreLbl, { color: C.textTertiary }]}>focus</Text>
                    </View>
                  </KeycapSurface>
                ))}
              </>
            )}

            {/* ── Delete Account ── */}
            <View style={styles.dangerZone}>
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: C.red }]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Text style={[styles.deleteButtonText, { color: C.red }]}>
                  {isDeleting ? 'Deleting...' : isGuest ? 'Delete Local Data' : 'Delete Account & Data'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 32 }} />

          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      {/* Avatar Customization Shop Modal */}
      <AvatarCustomizationShop visible={shopVisible} onClose={() => setShopVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: Colors.bg,
    zIndex: 100,
    borderRightWidth: 1,
    borderRightColor: 'rgba(175,158,128,0.28)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Spacing.md,
    marginRight: Spacing.sm,
    marginTop: Spacing.sm,
  },
  closeIcon: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  nameText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
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
    fontSize: Typography.size.xs,
  },
  customizeBtnOuter: {
    marginTop: Spacing.sm,
    alignSelf: 'stretch',
  },
  customizeBtnFace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  customizeButtonText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xs,
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
  xpCardOuter: { marginBottom: Spacing.sm },
  xpCardFace: { padding: Spacing.sm, gap: Spacing.sm },
  xpCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpTotal: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  xpRemaining: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },
  xpBarTrack: {
    height: 4,
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
    marginBottom: Spacing.sm,
  },
  gridCellOuter: { width: '48%' },
  gridCellFace: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  gridNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
  gridLbl: {
    fontFamily: Typography.fontMono,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  paletteCardOuter: { marginBottom: Spacing.sm },
  paletteCardFace: { padding: Spacing.sm, gap: Spacing.md },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paletteItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  paletteSwatch: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteAccentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paletteName: {
    fontFamily: Typography.fontMono,
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardLabel: {
    fontFamily: Typography.fontMono,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  unlocksCardOuter: { marginBottom: Spacing.md },
  unlocksCardFace: { padding: Spacing.sm, gap: Spacing.sm },
  unlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unlockDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  unlockText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xs,
  },
  sectionTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  sessionRowOuter: { marginBottom: Spacing.sm },
  sessionRowFace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  sessionLeft: { flex: 1 },
  sessionSubject: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: 2,
  },
  sessionMeta: {
    fontFamily: Typography.fontMono,
    fontSize: 8,
  },
  sessionRight: { alignItems: 'center' },
  sessionScore: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
  sessionScoreLbl: {
    fontFamily: Typography.fontMono,
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerZone: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
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
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
});
