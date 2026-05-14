import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Spacing, Radius, Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSessionStore } from '@/stores/sessionStore';
import { SoliAvatar } from '@/components/Mascots';
import { KeycapButton } from '@/components/KeycapSurface';
import type { ReflectionReason } from '@/types';
import * as Haptics from 'expo-haptics';

const REASONS: { key: ReflectionReason; label: string }[] = [
  { key: 'distraction', label: 'Distraction' },
  { key: 'tired', label: 'Tired' },
  { key: 'busy', label: 'Busy' },
  { key: 'other', label: 'Other' },
];

const SAGE_SUGGESTIONS: Record<ReflectionReason, string> = {
  distraction: "Try putting your phone in another room or using a site blocker next time.",
  tired: "A 10-minute power nap or a quick stretch can reset your focus levels.",
  busy: "That happens! Let's schedule a shorter, more intense block for later.",
  other: "Every session is a learning experience. We'll find your rhythm.",
};

export default function ReflectionScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const { setReflection } = useSessionStore();
  
  const [reason, setReason] = useState<ReflectionReason | null>(null);
  const [note, setNote] = useState('');

  function handleSave() {
    if (!reason) return;
    setReflection(reason, note);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/reward');
  }

  const suggestion = reason ? SAGE_SUGGESTIONS[reason] : "Reflection helps you build a more sustainable habit. Why are we stopping today?";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: C.textPrimary }]}>End Session Early?</Text>
            <Text style={[styles.subtitle, { color: C.textTertiary }]}>Why are you stopping?</Text>
          </View>

          <View style={styles.reasonsGrid}>
            {REASONS.map((r) => {
              const isActive = reason === r.key;
              return (
                <KeycapButton
                  key={r.key}
                  radius={Radius.lg}
                  style={styles.reasonBtnWrapper}
                  contentStyle={styles.reasonBtnFace}
                  faceColor={isActive ? C.purpleDim : C.bgInput}
                  depthColor={isActive ? C.purpleBorder : C.borderMid}
                  borderColor={isActive ? C.purpleBorder : C.border}
                  onPress={() => {
                    setReason(r.key);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[
                    styles.reasonText,
                    { color: C.textSecondary },
                    isActive && { color: C.purple, fontWeight: '600' },
                  ]}>
                    {r.label}
                  </Text>
                </KeycapButton>
              );
            })}
          </View>

          <View style={[styles.sageCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <View style={styles.sageHeader}>
              <SoliAvatar size={32} state={reason ? 'watching' : 'idle'} />
              <Text style={[styles.sageTitle, { color: C.purple }]}>Soli's Tip</Text>
            </View>
            <Text style={[styles.sageBody, { color: C.textSecondary }]}>
              {suggestion}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: C.textTertiary }]}>ADD A QUICK NOTE (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.bgInput, borderColor: C.border, color: C.textPrimary }]}
              placeholder="e.g., Neighbors were loud, couldn't get into flow..."
              placeholderTextColor={C.textTertiary}
              multiline
              numberOfLines={3}
              value={note}
              onChangeText={setNote}
            />
          </View>

          <KeycapButton
            radius={Radius.lg}
            style={[styles.saveBtnWrapper, !reason && { opacity: 0.5 }]}
            contentStyle={styles.saveBtnFace}
            faceColor={C.purple}
            depthColor={Colors.keycapAccentDepthColor}
            borderColor={C.purpleBorder}
            onPress={handleSave}
            disabled={!reason}
          >
            <Text style={styles.saveBtnText}>Save & Continue</Text>
          </KeycapButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
  },
  subtitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  reasonBtnWrapper: {
    flexBasis: '47%',
  },
  reasonBtnFace: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  reasonText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },
  sageCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  sageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sageTitle: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sageBody: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  inputSection: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: Typography.fontSans,
  },
  saveBtnWrapper: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  saveBtnFace: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: '600',
    color: '#FFF',
  },
});
