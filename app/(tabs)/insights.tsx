// app/(tabs)/insights.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { SageAvatar } from '@/components/SageAvatar';

// ─── Types ────────────────────────────────────────────────────────────────────
type InsightTagColor = 'purple' | 'green' | 'amber';

interface AIInsight {
  id: string;
  title: string;
  body: string;
  tag: string;
  tagColor: InsightTagColor;
}

// ─── Seed insights (shown before user has 5+ sessions) ───────────────────────
const SEED_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    title: 'Peak focus window',
    body: "You're consistently sharpest between 9–11am. Average focus score in this window is 91, vs 74 in the afternoon. Schedule your hardest subjects here.",
    tag: 'AI insight',
    tagColor: 'purple',
  },
  {
    id: '2',
    title: 'Session length sweet spot',
    body: '45-minute sessions give you a 12% higher focus score than 25-minute ones. You rarely drift in the first 35 minutes, then attention drops. Try a break at the 40-min mark.',
    tag: 'Pattern',
    tagColor: 'green',
  },
  {
    id: '3',
    title: 'Distraction trend',
    body: 'Friday afternoon sessions have 3× more distraction events than other slots. Consider moving non-essential sessions to your morning block.',
    tag: 'Watch',
    tagColor: 'amber',
  },
];

// Demo heatmap so the screen looks real before any sessions are logged
const SEED_HEATMAP: number[][] = [
  [0.30, 0.75, 0.90, 0.65, 0.80, 0.10, 0.10],
  [0.70, 0.95, 1.00, 0.85, 0.95, 0.15, 0.12],
  [0.10, 0.55, 0.15, 0.50, 0.10, 0.65, 0.75],
  [0.45, 0.20, 0.55, 0.10, 0.45, 0.40, 0.55],
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TIME_SLOTS = ['8am', '10am', '2pm', '8pm'];

const TAG_STYLES: Record<InsightTagColor, { bg: string; color: string }> = {
  purple: { bg: 'rgba(167,139,250,0.18)', color: Colors.purple },
  green:  { bg: 'rgba(74,222,128,0.14)',  color: Colors.green  },
  amber:  { bg: 'rgba(251,191,36,0.14)',  color: Colors.amber  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function intensityToColor(v: number): string {
  if (v < 0.05) return 'rgba(255,255,255,0.04)';
  if (v < 0.30) return 'rgba(167,139,250,0.18)';
  if (v < 0.55) return 'rgba(167,139,250,0.38)';
  if (v < 0.75) return 'rgba(167,139,250,0.62)';
  return 'rgba(167,139,250,0.92)';
}

// ─── Subcomponents ───────────────────────────────────────────────────────────
function HeatmapGrid({ data }: { data: number[][] }) {
  const screenW = Dimensions.get('window').width;
  // Available width = screen - screen padding (48) - card padding (32) - label col (40)
  const innerW = Math.max(220, screenW - 48 - 32 - 40);
  const gap = 4;
  const cellW = Math.floor((innerW - gap * 6) / 7);

  return (
    <View style={hm.wrap}>
      {/* Day header row */}
      <View style={hm.row}>
        <View style={hm.labelCol} />
        {DAYS.map((d, i) => (
          <View key={i} style={[hm.dayCell, { width: cellW }]}>
            <Text style={hm.dayText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Time-slot rows */}
      {TIME_SLOTS.map((slot, rowIdx) => (
        <View key={slot} style={hm.row}>
          <View style={hm.labelCol}>
            <Text style={hm.slotText}>{slot}</Text>
          </View>
          {DAYS.map((_, colIdx) => {
            const v = data[rowIdx]?.[colIdx] ?? 0;
            return (
              <View
                key={colIdx}
                style={[
                  hm.cell,
                  { width: cellW, backgroundColor: intensityToColor(v) },
                ]}
              />
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={hm.legend}>
        <View style={[hm.legendDot, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
        <Text style={hm.legendText}>None</Text>
        <View style={[hm.legendDot, { backgroundColor: 'rgba(167,139,250,0.38)' }]} />
        <Text style={hm.legendText}>Medium</Text>
        <View style={[hm.legendDot, { backgroundColor: 'rgba(167,139,250,0.92)' }]} />
        <Text style={hm.legendText}>Peak</Text>
      </View>
    </View>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const tag = TAG_STYLES[insight.tagColor];
  return (
    <View style={s.insightCard}>
      <View style={s.insightTop}>
        <Text style={s.insightTitle}>{insight.title}</Text>
        <View style={[s.insightTag, { backgroundColor: tag.bg }]}>
          <Text style={[s.insightTagText, { color: tag.color }]}>{insight.tag}</Text>
        </View>
      </View>
      <Text style={s.insightBody}>{insight.body}</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function InsightsScreen() {
  const sessions          = useUserStore((st) => st.sessions);
  const insights          = useUserStore((st) => st.insights);
  const suggestion        = useUserStore((st) => st.suggestion);
  const isLoadingInsights = useUserStore((st) => st.isLoadingInsights);
  const totalSessions     = useUserStore((st) => st.totalSessions);
  const streakDays        = useUserStore((st) => st.streakDays);
  const totalXp           = useUserStore((st) => st.totalXp);
  const getHeatmap        = useUserStore((st) => st.getHeatmap);

  const hasRealData = sessions.length >= 3;

  const heatmapData = useMemo(() => {
    if (hasRealData) {
      try {
        return getHeatmap();
      } catch {
        return SEED_HEATMAP;
      }
    }
    return SEED_HEATMAP;
  }, [sessions.length, hasRealData]);

  const displayInsights = insights.length > 0 ? insights : SEED_INSIGHTS;

  const avgFocus = sessions.length > 0
    ? Math.round(sessions.reduce((a, x) => a + x.focusScore, 0) / sessions.length)
    : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={s.title}>Your focus</Text>
        <Text style={s.subtitle}>
          {totalSessions} sessions · {streakDays} day streak
        </Text>

        {/* ── Stat row ── */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: Colors.purple }]}>{totalXp}</Text>
            <Text style={s.statLbl}>Total XP</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: Colors.amber }]}>{streakDays}</Text>
            <Text style={s.statLbl}>Streak</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: Colors.green }]}>
              {avgFocus || '--'}
            </Text>
            <Text style={s.statLbl}>Avg focus</Text>
          </View>
        </View>

        {/* ── Heatmap card ── */}
        <View style={s.heatmapCard}>
          <Text style={s.cardLabel}>Weekly focus heatmap</Text>
          {!hasRealData && (
            <Text style={s.seedNote}>
              Complete 3+ sessions to see your real patterns
            </Text>
          )}
          <HeatmapGrid data={heatmapData} />
        </View>

        {/* ── Sage suggestion ── */}
        {isLoadingInsights ? (
          <View style={s.loadingCard}>
            <ActivityIndicator color={Colors.purple} size="small" />
            <Text style={s.loadingText}>Sage is analysing your sessions…</Text>
          </View>
        ) : suggestion ? (
          <View style={s.suggestionCard}>
            <View style={s.suggestionTop}>
              <SageAvatar size={28} state="watching" />
              <Text style={s.suggestionTitle}>Sage's recommendation</Text>
            </View>
            <Text style={s.suggestionBody}>{suggestion.message}</Text>
            {suggestion.pills && suggestion.pills.length > 0 && (
              <View style={s.pillRow}>
                {suggestion.pills.map((p, i) => (
                  <View key={i} style={s.pill}>
                    <Text style={s.pillText}>{p.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={s.suggestionCard}>
            <View style={s.suggestionTop}>
              <SageAvatar size={28} state="watching" />
              <Text style={s.suggestionTitle}>Sage's recommendation</Text>
            </View>
            <Text style={s.suggestionBody}>
              Complete a few more sessions and I'll start surfacing patterns specific to you. For now — your morning sessions tend to hit hardest. Lean into that.
            </Text>
            <View style={s.pillRow}>
              <View style={s.pill}><Text style={s.pillText}>Try · 45min · 9am</Text></View>
            </View>
          </View>
        )}

        {/* ── Insight cards ── */}
        <Text style={s.sectionTitle}>Insights</Text>
        {displayInsights.map((it) => (
          <InsightCard key={it.id} insight={it} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
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
    backgroundColor: 'rgba(167,139,250,0.18)',
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

// Standalone styles for the heatmap subcomponent
const hm = StyleSheet.create({
  wrap: { gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelCol: {
    width: 36,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  dayCell: {
    alignItems: 'center',
  },
  dayText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  slotText: {
    fontFamily: Typography.fontMono,
    fontSize: 9,
    color: Colors.textTertiary,
  },
  cell: {
    height: 26,
    borderRadius: 5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: Typography.fontMono,
    fontSize: 9,
    color: Colors.textTertiary,
    marginRight: 6,
  },
});