// app/(tabs)/insights.tsx  — AI insights + focus heatmap screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { HeatmapCanvas } from '@/components/HeatmapCanvas';
import { SageAvatar } from '@/components/SageAvatar';
import type { AIInsight } from '@/types';

// ─── Hardcoded seed insights — replaced by AI-generated ones after 5+ sessions ──
const SEED_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'peak-window',
    title: 'Peak focus window',
    body: 'You\'re consistently sharpest between 9–11am. Your average focus score in this window is 91, vs 74 in the afternoon. Schedule your hardest subjects here.',
    tag: 'AI insight',
    tagColor: 'purple',
  },
  {
    id: '2',
    type: 'sweet-spot',
    title: 'Session length sweet spot',
    body: '45-minute sessions give you a 12% higher focus score than 25-minute ones. You rarely drift in the first 35 minutes — then attention drops. Try a break at the 40-min mark.',
    tag: 'Pattern',
    tagColor: 'green',
  },
  {
    id: '3',
    type: 'distraction',
    title: 'Distraction trend',
    body: 'Friday afternoon sessions have 3× more distraction events than other slots. Consider moving non-essential sessions to your morning block.',
    tag: 'Watch',
    tagColor: 'amber',
  },
];

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  purple: { bg: Colors.purpleDim,                    color: Colors.purple },
  green:  { bg: 'rgba(74,222,128,0.14)',              color: Colors.green },
  amber:  { bg: 'rgba(251,191,36,0.14)',              color: Colors.amber },
};

function InsightCard({ insight }: { insight: AIInsight }) {
  const tag = TAG_STYLES[insight.tagColor];
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightTop}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <View style={[styles.insightTag, { backgroundColor: tag.bg }]}>
          <Text style={[styles.insightTagText, { color: tag.color }]}>{insight.tag}</Text>
        </View>
      </View>
      <Text style={styles.insightBody}>{insight.body}</Text>
    </View>
  );
}

// ─── Seed heatmap (shows before any sessions are logged) ─────────────────────
const SEED_HEATMAP: number[][] = [
  [0.3, 0.75, 0.9,  0.65, 0.8,  0.1,  0.1 ],
  [0.7, 0.95, 1.0,  0.85, 0.95, 0.15, 0.12],
  [0.1, 0.55, 0.15, 0.5,  0.1,  0.65, 0.75],
  [0.45, 0.2, 0.55, 0.1,  0.45, 0.4,  0.55],
];

export default function InsightsScreen() {
  const { sessions, insights, suggestion, isLoadingInsights, totalSessions, streakDays, totalXp } =
    useUserStore();

  const hasData = sessions.length >= 3;
  const heatmapData = hasData
    ? useUserStore.getState().getHeatmap()
    : SEED_HEATMAP;
  const displayInsights = insights.length > 0 ? insights : SEED_INSIGHTS;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={styles.title}>Your focus</Text>
        <Text style={styles.subtitle}>
          {totalSessions} sessions · {streakDays} day streak
        </Text>

        {/* ── Summary stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: Colors.purple }]}>{totalXp}</Text>
            <Text style={styles.statLbl}>Total XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: Colors.amber }]}>{streakDays}</Text>
            <Text style={styles.statLbl}>Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: Colors.green }]}>
              {sessions.length > 0
                ? Math.round(sessions.reduce((a, s) => a + s.focusScore, 0) / sessions.length)
                : '--'}
            </Text>
            <Text style={styles.statLbl}>Avg focus</Text>
          </View>
        </View>

        {/* ── Heatmap ── */}
        <View style={styles.heatmapCard}>
          <Text style={styles.cardLabel}>Weekly focus heatmap</Text>
          {!hasData && (
            <Text style={styles.seedNote}>
              Complete 3+ sessions to see your real patterns
            </Text>
          )}
          <HeatmapCanvas data={heatmapData} />
        </View>

        {/* ── Sage suggestion ── */}
        {isLoadingInsights ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={Colors.purple} size="small" />
            <Text style={styles.loadingText}>Sage is analysing your sessions…</Text>
          </View>
        ) : suggestion ? (
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionTop}>
              <SageAvatar size={28} state="watching" />
              <Text style={styles.suggestionTitle}>Sage's recommendation</Text>
            </View>
            <Text style={styles.suggestionBody}>{suggestion.message}</Text>
            <View style={styles.pillRow}>
              {suggestion.pills.map((p, i) => (
                <View key={i} style={styles.pill}>
                  <Text style={styles.pillText}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── AI Insights ── */}
        <Text style={styles.sectionTitle}>Insights</Text>
        {displayInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl },

  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
  },
  statLbl: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  heatmapCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  cardLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  seedNote: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textHint,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },

  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  loadingText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },

  suggestionCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.purpleBorder,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  suggestionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  suggestionTitle: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    color: Colors.purple,
    fontWeight: Typography.weight.medium,
  },
  suggestionBody: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  pill: {
    backgroundColor: Colors.purpleDim,
    borderWidth: 0.5,
    borderColor: Colors.purpleBorder,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  pillText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.purple,
  },

  sectionTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  insightCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  insightTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  insightTag: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  insightTagText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  insightBody: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
