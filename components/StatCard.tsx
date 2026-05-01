// components/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
}

export function StatCard({ value, label, valueColor }: StatCardProps) {
  const C = useThemeColors();
  const styles = makeStyles(C);
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: valueColor ?? C.textPrimary }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function makeStyles(C: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: C.bgCard,
      borderWidth: 0.5,
      borderColor: C.border,
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
      color: C.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 3,
    },
  });
}
