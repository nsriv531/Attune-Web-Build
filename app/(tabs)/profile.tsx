// app/(tabs)/profile.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { SageAvatar } from '@/components/SageAvatar';

const LEVEL_NAMES = ['Seedling', 'Sprout', 'Scholar', 'Focus Pro', 'Sage'];
const LEVEL_XP    = [0, 200, 500, 1000, 2000];
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

export default function ProfileScreen() {
  const { name, totalXp, streakDays, totalSessions, sessions } = useUserStore();

  const level = getLevel(totalXp);
  const levelName = LEVEL_NAMES[level - 1];
  const pct = progressToNext(totalXp);
  const remaining = xpToNext(totalXp);

  const avgFocus =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, s) => a + s.focusScore, 0) / sessions.length)
      : 0;

  const totalHours = Math.round((sessions.reduce((a, s) => a + s.durationMinutes, 0) / 60) * 10) / 10;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Avatar + identity ── */}
        <View style={styles.avatarSection}>
          <SageAvatar size={88} state="watching" />
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {level} · {levelName}</Text>
          </View>
        </View>

        {/* ── XP progress bar ── */}
        <View style={styles.xpCard}>
          <View style={styles.xpCardTop}>
            <Text style={styles.xpTotal}>{totalXp} XP</Text>
            {remaining > 0 && (
              <Text style={styles.xpRemaining}>{remaining} XP to Level {level + 1}</Text>
            )}
          </View>
          <View style={styles.xpBarTrack}>
            <View style={[styles.xpBarFill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
        </View>

        {/* ── Stats grid ── */}
        <View style={styles.grid}>
          {[
            { label: 'Sessions', value: totalSessions, color: Colors.textPrimary },
            { label: 'Streak',   value: `${streakDays}d`, color: Colors.amber },
            { label: 'Avg focus', value: avgFocus || '--', color: Colors.green },
            { label: 'Hours',    value: totalHours,  color: Colors.purple },
          ].map((s) => (
            <View key={s.label} style={styles.gridCell}>
              <Text style={[styles.gridNum, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.gridLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Unlocks ── */}
        <View style={styles.unlocksCard}>
          <Text style={styles.cardLabel}>Sage unlocks</Text>
          {(UNLOCKS[level] ?? []).map((u) => (
            <View key={u} style={styles.unlockRow}>
              <View style={styles.unlockDot} />
              <Text style={styles.unlockText}>{u}</Text>
            </View>
          ))}
          {level < 5 && (
            <View style={[styles.unlockRow, { opacity: 0.35 }]}>
              <View style={[styles.unlockDot, { backgroundColor: Colors.textHint }]} />
              <Text style={styles.unlockText}>
                {UNLOCKS[level + 1]?.[level]} — reach Level {level + 1}
              </Text>
            </View>
          )}
        </View>

        {/* ── Recent sessions ── */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent sessions</Text>
            {sessions.slice(0, 5).map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionSubject} numberOfLines={1}>{s.subject}</Text>
                  <Text style={styles.sessionMeta}>
                    {s.durationMinutes}min · {new Date(s.startedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={[styles.sessionScore, {
                    color: s.focusScore >= 80 ? Colors.green : s.focusScore >= 60 ? Colors.amber : Colors.red
                  }]}>
                    {s.focusScore}
                  </Text>
                  <Text style={styles.sessionScoreLbl}>focus</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
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
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  levelBadge: {
    backgroundColor: Colors.purpleDim,
    borderWidth: 0.5,
    borderColor: Colors.purpleBorder,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  levelBadgeText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    color: Colors.purple,
  },

  xpCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
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
    color: Colors.purple,
  },
  xpRemaining: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  xpBarTrack: {
    height: 5,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: Colors.purple,
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
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
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
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },

  unlocksCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  cardLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
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
    backgroundColor: Colors.purple,
  },
  unlockText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },

  sectionTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sessionLeft: { flex: 1 },
  sessionSubject: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
    marginBottom: 2,
  },
  sessionMeta: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
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
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
