// components/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
}

export function StatCard({ value, label, valueColor = Colors.textPrimary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  value: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
  },
  label: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },
});
