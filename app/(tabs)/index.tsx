// app/(tabs)/index.tsx  — Setup / Cue screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, Radius, Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { useRitualAudio } from '@/hooks/useAudioPlayer';
import type { SessionDuration, RitualSound } from '@/types';

const DURATIONS: SessionDuration[] = [1, 25, 45, 60, 90];
const SOUNDS: { key: RitualSound; label: string }[] = [
  { key: 'lofi',        label: 'Lo-fi' },
  { key: 'rain',        label: 'Rain' },
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
  const C = useThemeColors();
  const router = useRouter();
  const { name, streakDays, suggestion } = useUserStore();
  const { subject, durationMinutes, ritualSound, setSubject, setDuration, setRitualSound, startSession } =
    useSessionStore();

  // Enable preview audio
  const { previewTimerActive } = useRitualAudio(true);

  // Animation for preview progress
  const previewProgress = useSharedValue(0);

  useEffect(() => {
    if (previewTimerActive) {
      previewProgress.value = 0;
      previewProgress.value = withTiming(1, { 
        duration: 15000, 
        easing: Easing.linear 
      });
    } else {
      previewProgress.value = 0;
    }
  }, [previewTimerActive]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${(1 - previewProgress.value) * 100}%`,
  }));

  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession();
    router.navigate('/(tabs)/session');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: C.textTertiary }]}>{greeting}</Text>
          <Text style={[styles.heading, { color: C.textPrimary }]}>
            Ready to{'\n'}study, <Text style={{ color: C.purple }}>{name}?</Text>
          </Text>
        </View>

        {/* ── Sage suggestion pill ── */}
        {suggestion && (
          <Pressable
            style={[styles.suggestionPill, { backgroundColor: C.purpleDim, borderColor: C.purpleBorder }]}
            onPress={() => router.push('/(tabs)/insights')}
          >
            <View style={[styles.suggestionDot, { backgroundColor: C.purple }]} />
            <Text style={[styles.suggestionText, { color: C.purple }]} numberOfLines={1}>
              Sage: {suggestion.message.split('.')[0]}
            </Text>
          </Pressable>
        )}

        {/* ── Streak chip ── */}
        <View style={styles.streakRow}>
          <View style={[styles.streakChip, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <Text style={[styles.streakNum, { color: C.amber }]}>{streakDays}</Text>
            <Text style={[styles.streakLbl, { color: C.textTertiary }]}> day streak</Text>
          </View>
        </View>

        {/* ── Subject picker ── */}
        <Text style={[styles.sectionLabel, { color: C.textTertiary }]}>Subject</Text>
        <Pressable
          style={[styles.subjectInput, { backgroundColor: C.bgInput, borderColor: C.borderMid }]}
          onPress={() => setShowSubjectPicker((v) => !v)}
        >
          <Text style={[styles.subjectValue, { color: C.textPrimary }]}>{subject}</Text>
          <Text style={[styles.chevron, { color: C.textTertiary }]}>{showSubjectPicker ? '▲' : '▼'}</Text>
        </Pressable>

        {showSubjectPicker && (
          <View style={[styles.subjectDropdown, { backgroundColor: C.bgCard, borderColor: C.borderMid }]}>
            {SUBJECTS.map((s) => (
              <Pressable
                key={s.id}
                style={[
                  styles.subjectOption,
                  { borderBottomColor: C.border },
                  s.name === subject && { backgroundColor: C.purpleDim },
                ]}
                onPress={() => {
                  setSubject(s.name, s.id);
                  setShowSubjectPicker(false);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.subjectOptionText, { color: C.textSecondary }, s.name === subject && { color: C.purple }]}>
                  {s.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Duration ── */}
        <Text style={[styles.sectionLabel, { color: C.textTertiary }]}>Session length</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d}
              style={[
                styles.durBtn,
                { backgroundColor: C.bgInput, borderColor: C.border },
                durationMinutes === d && { backgroundColor: C.purpleDim, borderColor: C.purpleBorder },
              ]}
              onPress={() => {
                setDuration(d);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.durNum, { color: C.textSecondary }, durationMinutes === d && { color: C.purple }]}>{d}</Text>
              <Text style={[styles.durLbl, { color: C.textHint }, durationMinutes === d && { color: C.purpleDim }]}>min</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Ritual sound ── */}
        <Text style={[styles.sectionLabel, { color: C.textTertiary }]}>Ritual sound</Text>
        <View style={styles.soundRow}>
          {SOUNDS.map((s) => (
            <Pressable
              key={s.key}
              style={[
                styles.soundBtn,
                { backgroundColor: C.bgInput, borderColor: C.border },
                ritualSound === s.key && { borderColor: C.borderMid },
              ]}
              onPress={() => {
                setRitualSound(s.key);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.soundText, { color: C.textTertiary }, ritualSound === s.key && { color: C.textPrimary }]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Preview Indicator ── */}
        {ritualSound !== 'silence' && previewTimerActive && (
          <View style={styles.previewCard}>
            <View style={styles.previewDot} />
            <Text style={styles.previewText}>
              Previewing {SOUNDS.find(s => s.key === ritualSound)?.label}...
            </Text>
            <Animated.View style={[styles.previewProgressBar, animatedProgressStyle]} />
          </View>
        )}

        <View style={styles.spacer} />

        {/* ── CTA ── */}
        <Pressable style={[styles.startBtn, { backgroundColor: C.purple }]} onPress={handleStart}>
          <Text style={styles.startBtnText}>Start session</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, paddingBottom: 40 },

  header: { marginBottom: Spacing.lg },
  greeting: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heading: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    lineHeight: 36,
  },

  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 0.5,
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
  },
  suggestionText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },

  streakRow: { marginBottom: Spacing.xl },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  streakNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  streakLbl: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.sm,
  },

  sectionLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  subjectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  subjectValue: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
  },
  chevron: {
    fontSize: 10,
  },
  subjectDropdown: {
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    marginTop: -Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  subjectOption: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },
  subjectOptionText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },

  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  durBtn: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  durNum: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
  },
  durLbl: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  soundRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  soundBtn: {
    borderWidth: 0.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  soundText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
  },
  soundTextSel: { color: Colors.purple },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginTop: -Spacing.xs,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.purple,
  },
  previewText: {
    fontFamily: Typography.fontMono,
    fontSize: 11,
    color: Colors.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: Colors.purple,
    borderRadius: Radius.full,
  },

  spacer: { flex: 1, minHeight: Spacing.xl },


  startBtn: {
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
