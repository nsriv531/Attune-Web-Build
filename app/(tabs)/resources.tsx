import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Typography, Spacing, Radius, Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { KeycapSurface } from '@/components/KeycapSurface';

export default function ResourcesScreen() {
  const C = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
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
        <KeycapSurface radius={Radius.lg} style={styles.cardOuter} contentStyle={styles.cardFace}>
          <Text style={[styles.cardTitle, { color: C.textPrimary }]}>Coming Soon</Text>
          <Text style={[styles.cardText, { color: C.textSecondary }]}>
            We're building a curated library of focus techniques, science-backed insights, and learning materials.
          </Text>
        </KeycapSurface>

        {/* Placeholder Cards */}
        {[
          { title: 'Techniques', desc: 'Learn proven focus methods' },
          { title: 'Guides', desc: 'Deep dive into focus science' },
          { title: 'Community', desc: 'Connect with others' },
        ].map((item, idx) => (
          <KeycapSurface
            key={idx}
            radius={Radius.lg}
            style={styles.placeholderCardOuter}
            contentStyle={styles.placeholderCardFace}
          >
            <Text style={[styles.placeholderTitle, { color: C.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.placeholderDesc, { color: C.textTertiary }]}>{item.desc}</Text>
          </KeycapSurface>
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

  cardOuter: { marginBottom: Spacing.xl },
  cardFace: { padding: Spacing.lg },
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

  placeholderCardOuter: { marginBottom: Spacing.md },
  placeholderCardFace: { padding: Spacing.lg },
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
