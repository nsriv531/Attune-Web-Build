// app/(tabs)/index.tsx  — Setup / Cue screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import type { SessionDuration, RitualSound } from '@/types';

const DURATIONS: SessionDuration[] = [25, 45, 60, 90];
const SOUNDS: { key: RitualSound; label: string }[] = [
  { key: 'lofi-rain',   label: 'Lo-fi rain' },
  { key: 'forest',      label: 'Forest' },
  { key: 'white-noise', label: 'White noise' },
  { key: 'silence',     label: 'Silence' },
];
const SUBJECTS = [
  { id: 'bio-1',  name: 'Biology — Chapter 7' },
  { id: 'math-1', name: 'Mathematics — Calculus' },
  { id: 'hist-1', name: 'History — WW2' },
  { id: 'eng-1',  name: 'English Literature' },
  { id: 'chem-1', name: 'Chemistry — Organic' },
];

export default function SetupScreen() {
  const router = useRouter();
  const { name, streakDays, suggestion } = useUserStore();
  const { subject, durationMinutes, ritualSound, setSubject, setDuration, setRitualSound, startSession } =
    useSessionStore();

  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession();
    router.push('/(tabs)/session');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.heading}>
            Ready to{'\n'}study, <Text style={styles.headingAccent}>{name}?</Text>
          </Text>
        </View>

        {/* ── Sage suggestion pill ── */}
        {suggestion && (
          <Pressable style={styles.suggestionPill} onPress={() => router.push('/(tabs)/insights')}>
            <View style={styles.suggestionDot} />
            <Text style={styles.suggestionText} numberOfLines={1}>
              Sage: {suggestion.message.split('.')[0]}
            </Text>
          </Pressable>
        )}

        {/* ── Streak chip ── */}
        <View style={styles.streakRow}>
          <View style={styles.streakChip}>
            <Text style={styles.streakNum}>{streakDays}</Text>
            <Text style={styles.streakLbl}> day streak</Text>
          </View>
        </View>

        {/* ── Subject picker ── */}
        <Text style={styles.sectionLabel}>Subject</Text>
        <Pressable
          style={styles.subjectInput}
          onPress={() => setShowSubjectPicker((v) => !v)}
        >
          <Text style={styles.subjectValue}>{subject}</Text>
          <Text style={styles.chevron}>{showSubjectPicker ? '▲' : '▼'}</Text>
        </Pressable>

        {showSubjectPicker && (
          <View style={styles.subjectDropdown}>
            {SUBJECTS.map((s) => (
              <Pressable
                key={s.id}
                style={[styles.subjectOption, s.name === subject && styles.subjectOptionSel]}
                onPress={() => {
                  setSubject(s.name, s.id);
                  setShowSubjectPicker(false);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[styles.subjectOptionText, s.name === subject && styles.subjectOptionTextSel]}
                >
                  {s.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Duration ── */}
        <Text style={styles.sectionLabel}>Session length</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d}
              style={[styles.durBtn, durationMinutes === d && styles.durBtnSel]}
              onPress={() => {
                setDuration(d);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.durNum, durationMinutes === d && styles.durNumSel]}>{d}</Text>
              <Text style={[styles.durLbl, durationMinutes === d && styles.durLblSel]}>min</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Ritual sound ── */}
        <Text style={styles.sectionLabel}>Ritual sound</Text>
        <View style={styles.soundRow}>
          {SOUNDS.map((s) => (
            <Pressable
              key={s.key}
              style={[styles.soundBtn, ritualSound === s.key && styles.soundBtnSel]}
              onPress={() => {
                setRitualSound(s.key);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.soundText, ritualSound === s.key && styles.soundTextSel]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.spacer} />

        {/* ── CTA ── */}
        <Pressable style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Start session</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },

  header: { marginBottom: Spacing.lg },
  greeting: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heading: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  headingAccent: { color: Colors.purple },

  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.purpleDim,
    borderWidth: 0.5,
    borderColor: Colors.purpleBorder,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.base,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.purple,
  },
  suggestionText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.purple,
    fontWeight: Typography.weight.medium,
  },

  streakRow: { marginBottom: Spacing.xl },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  streakNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.base,
    color: Colors.amber,
    fontWeight: Typography.weight.medium,
  },
  streakLbl: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },

  sectionLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  subjectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgInput,
    borderWidth: 0.5,
    borderColor: Colors.borderMid,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  subjectValue: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  chevron: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  subjectDropdown: {
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.borderMid,
    borderRadius: Radius.lg,
    marginTop: -Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  subjectOption: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  subjectOptionSel: { backgroundColor: Colors.purpleDim },
  subjectOptionText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  subjectOptionTextSel: { color: Colors.purple },

  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  durBtn: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  durBtnSel: {
    backgroundColor: Colors.purpleDim,
    borderColor: Colors.purpleBorder,
  },
  durNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
  },
  durNumSel: { color: Colors.purple },
  durLbl: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textHint,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  durLblSel: { color: 'rgba(167,139,250,0.6)' },

  soundRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  soundBtn: {
    backgroundColor: Colors.bgInput,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  soundBtnSel: {
    backgroundColor: Colors.bgInput,
    borderColor: Colors.borderMid,
  },
  soundText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  soundTextSel: { color: Colors.textPrimary },

  spacer: { flex: 1, minHeight: Spacing.xl },

  startBtn: {
    backgroundColor: Colors.purple,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: '#fff',
    letterSpacing: 0.2,
  },
});
