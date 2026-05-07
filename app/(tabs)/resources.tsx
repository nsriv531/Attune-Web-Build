import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function ResourcesScreen() {
  const C = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Resources</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            Learn how to deepen your focus practice.
          </Text>
        </View>

        {/* Coming Soon Card */}
        <View style={[styles.card, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.textPrimary }]}>Coming Soon</Text>
          <Text style={[styles.cardText, { color: C.textSecondary }]}>
            We're building a curated library of focus techniques, science-backed insights, and learning materials.
          </Text>
        </View>

        {/* Placeholder Cards */}
        {[
          { title: 'Techniques', desc: 'Learn proven focus methods' },
          { title: 'Guides', desc: 'Deep dive into focus science' },
          { title: 'Community', desc: 'Connect with others' },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[styles.placeholderCard, { backgroundColor: C.bgCard, borderColor: C.border }]}
          >
            <Text style={[styles.placeholderTitle, { color: C.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.placeholderDesc, { color: C.textTertiary }]}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, paddingBottom: 40 },

  header: { marginBottom: Spacing.lg },
  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },

  card: {
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  cardText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    lineHeight: 22,
  },

  placeholderCard: {
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  placeholderTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
  },
  placeholderDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
  },
});
