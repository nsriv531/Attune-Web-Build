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
import { Typography, Spacing, Radius, Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useUserStore } from '@/stores/userStore';
import { SoliAvatar } from '@/components/SoliAvatar';
import { KeycapSurface } from '@/components/KeycapSurface';

type InsightTagColor = 'purple' | 'green' | 'amber';

interface AIInsight {
  id: string;
  title: string;
  body: string;
  tag: string;
  tagColor: InsightTagColor;
}

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

const SEED_HEATMAP: number[][] = [
  [0.30, 0.75, 0.90, 0.65, 0.80, 0.10, 0.10],
  [0.70, 0.95, 1.00, 0.85, 0.95, 0.15, 0.12],
  [0.10, 0.55, 0.15, 0.50, 0.10, 0.65, 0.75],
  [0.45, 0.20, 0.55, 0.10, 0.45, 0.40, 0.55],
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TIME_SLOTS = ['8am', '10am', '2pm', '8pm'];

function intensityToColor(v: number, accent: string): string {
  if (v < 0.05) return 'rgba(255,255,255,0.04)';
  if (v < 0.30) return `${accent}2e`;
  if (v < 0.55) return `${accent}61`;
  if (v < 0.75) return `${accent}9e`;
  return `${accent}eb`;
}

function HeatmapGrid({ data }: { data: number[][] }) {
  const C = useThemeColors();
  const screenW = Dimensions.get('window').width;
  const innerW = Math.max(220, screenW - 48 - 32 - 40);
  const gap = 4;
  const cellW = Math.floor((innerW - gap * 6) / 7);

  return (
    <View style={hm.wrap}>
      <View style={hm.row}>
        <View style={hm.labelCol} />
        {DAYS.map((d, i) => (
          <View key={i} style={[hm.dayCell, { width: cellW }]}>
            <Text style={[hm.dayText, { color: C.textTertiary }]}>{d}</Text>
          </View>
        ))}
      </View>

      {TIME_SLOTS.map((slot, rowIdx) => (
        <View key={slot} style={hm.row}>
          <View style={hm.labelCol}>
            <Text style={[hm.slotText, { color: C.textTertiary }]}>{slot}</Text>
          </View>
          {DAYS.map((_, colIdx) => {
            const v = data[rowIdx]?.[colIdx] ?? 0;
            return (
              <View
                key={colIdx}
                style={[
                  hm.cell,
                  { width: cellW, backgroundColor: intensityToColor(v, C.purple) },
                ]}
              />
            );
          })}
        </View>
      ))}

      <View style={hm.legend}>
        <View style={[hm.legendDot, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
        <Text style={[hm.legendText, { color: C.textTertiary }]}>None</Text>
        <View style={[hm.legendDot, { backgroundColor: `${C.purple}61` }]} />
        <Text style={[hm.legendText, { color: C.textTertiary }]}>Medium</Text>
        <View style={[hm.legendDot, { backgroundColor: `${C.purple}eb` }]} />
        <Text style={[hm.legendText, { color: C.textTertiary }]}>Peak</Text>
      </View>
    </View>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const C = useThemeColors();
  const tagStyles: Record<InsightTagColor, { bg: string; color: string }> = {
    purple: { bg: C.purpleDim, color: C.purple },
    green:  { bg: 'rgba(74,222,128,0.14)',  color: C.green },
    amber:  { bg: 'rgba(251,191,36,0.14)',  color: C.amber },
  };
  const tag = tagStyles[insight.tagColor];
  return (
    <KeycapSurface radius={Radius.xl} style={s.insightCardOuter} contentStyle={s.insightCardFace}>
      <View style={s.insightTop}>
        <Text style={[s.insightTitle, { color: C.textPrimary }]}>{insight.title}</Text>
        <View style={[s.insightTag, { backgroundColor: tag.bg }]}>
          <Text style={[s.insightTagText, { color: tag.color }]}>{insight.tag}</Text>
        </View>
      </View>
      <Text style={[s.insightBody, { color: C.textSecondary }]}>{insight.body}</Text>
    </KeycapSurface>
  );
}

export default function InsightsScreen() {
  const C = useThemeColors();
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
      try { return getHeatmap(); } catch { return SEED_HEATMAP; }
    }
    return SEED_HEATMAP;
  }, [sessions.length, hasRealData]);

  const displayInsights = insights.length > 0 ? insights : SEED_INSIGHTS;

  const avgFocus = sessions.length > 0
    ? Math.round(sessions.reduce((a, x) => a + x.focusScore, 0) / sessions.length)
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.title, { color: C.textPrimary }]}>Your focus</Text>
        <Text style={[s.subtitle, { color: C.textTertiary }]}>
          {totalSessions} sessions · {streakDays} day streak
        </Text>

        <View style={s.statsRow}>
          <KeycapSurface radius={Radius.lg} style={{ flex: 1 }} contentStyle={s.statBoxFace}>
            <Text style={[s.statNum, { color: C.purple }]}>{totalXp}</Text>
            <Text style={[s.statLbl, { color: C.textTertiary }]}>Total XP</Text>
          </KeycapSurface>
          <KeycapSurface radius={Radius.lg} style={{ flex: 1 }} contentStyle={s.statBoxFace}>
            <Text style={[s.statNum, { color: C.amber }]}>{streakDays}</Text>
            <Text style={[s.statLbl, { color: C.textTertiary }]}>Streak</Text>
          </KeycapSurface>
          <KeycapSurface radius={Radius.lg} style={{ flex: 1 }} contentStyle={s.statBoxFace}>
            <Text style={[s.statNum, { color: C.green }]}>{avgFocus || '--'}</Text>
            <Text style={[s.statLbl, { color: C.textTertiary }]}>Avg focus</Text>
          </KeycapSurface>
        </View>

        <KeycapSurface radius={Radius.xl} style={s.heatmapCardOuter} contentStyle={s.heatmapCardFace}>
          <Text style={[s.cardLabel, { color: C.textTertiary }]}>Weekly focus heatmap</Text>
          {!hasRealData && (
            <Text style={[s.seedNote, { color: C.textHint }]}>
              Complete 3+ sessions to see your real patterns
            </Text>
          )}
          <HeatmapGrid data={heatmapData} />
        </KeycapSurface>

        {isLoadingInsights ? (
          <KeycapSurface radius={Radius.xl} style={s.suggestionCardOuter} contentStyle={s.loadingCardFace}>
            <ActivityIndicator color={C.purple} size="small" />
            <Text style={[s.loadingText, { color: C.textTertiary }]}>Sage is analysing your sessions…</Text>
          </KeycapSurface>
        ) : suggestion ? (
          <KeycapSurface radius={Radius.xl} style={s.suggestionCardOuter} contentStyle={s.suggestionCardFace}>
            <View style={s.suggestionTop}>
              <SoliAvatar size={28} state="watching" />
              <Text style={[s.suggestionTitle, { color: C.purple }]}>Soli's recommendation</Text>
            </View>
            <Text style={[s.suggestionBody, { color: C.textSecondary }]}>{suggestion.message}</Text>
            {suggestion.pills && suggestion.pills.length > 0 && (
              <View style={s.pillRow}>
                {suggestion.pills.map((p, i) => (
                  <View key={i} style={[s.pill, { backgroundColor: C.purpleDim, borderColor: C.purpleBorder }]}>
                    <Text style={[s.pillText, { color: C.purple }]}>{p.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </KeycapSurface>
        ) : (
          <KeycapSurface radius={Radius.xl} style={s.suggestionCardOuter} contentStyle={s.suggestionCardFace}>
            <View style={s.suggestionTop}>
              <SoliAvatar size={28} state="watching" />
              <Text style={[s.suggestionTitle, { color: C.purple }]}>Soli's recommendation</Text>
            </View>
            <Text style={[s.suggestionBody, { color: C.textSecondary }]}>
              Complete a few more sessions and I'll start surfacing patterns specific to you. For now — your morning sessions tend to hit hardest. Lean into that.
            </Text>
            <View style={s.pillRow}>
              <View style={[s.pill, { backgroundColor: C.purpleDim, borderColor: C.purpleBorder }]}>
                <Text style={[s.pillText, { color: C.purple }]}>Try · 45min · 9am</Text>
              </View>
            </View>
          </KeycapSurface>
        )}

        <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Insights</Text>
        {displayInsights.map((it) => (
          <InsightCard key={it.id} insight={it} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  content: { padding: Spacing.xl },

  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statBoxFace: {
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  heatmapCardOuter: {
    marginBottom: Spacing.base,
  },
  heatmapCardFace: {
    padding: Spacing.base,
  },
  cardLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  seedNote: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },

  loadingCardFace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
  },
  loadingText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
  },

  suggestionCardOuter: {
    marginBottom: Spacing.base,
  },
  suggestionCardFace: {
    padding: Spacing.base,
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
    fontWeight: Typography.weight.medium,
  },
  suggestionBody: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  pill: {
    borderWidth: 0.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  pillText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
  },

  sectionTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  insightCardOuter: {
    marginBottom: Spacing.md,
  },
  insightCardFace: {
    padding: Spacing.base,
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
    lineHeight: 20,
  },
});

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
  },
  slotText: {
    fontFamily: Typography.fontMono,
    fontSize: 9,
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
    marginRight: 6,
  },
});
