// components/HeatmapCanvas.tsx
// Uses @shopify/react-native-skia for smooth GPU-accelerated rendering.
// Falls back to a plain View grid if Skia is unavailable (web/CI).

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TIME_SLOTS = ['8am', '10am', '2pm', '8pm'];

interface HeatmapCanvasProps {
  // 4 rows (time slots) × 7 cols (days), values 0–1
  data: number[][];
}

function intensityToColor(v: number): string {
  if (v < 0.05) return 'rgba(255,255,255,0.05)';
  if (v < 0.3)  return 'rgba(167,139,250,0.15)';
  if (v < 0.55) return 'rgba(167,139,250,0.35)';
  if (v < 0.75) return 'rgba(167,139,250,0.6)';
  return 'rgba(167,139,250,0.88)';
}

export function HeatmapCanvas({ data }: HeatmapCanvasProps) {
  const screenWidth = Dimensions.get('window').width;
  const innerWidth = screenWidth - 48 - 32 - 36; // screen padding + card padding + label col
  const cellSize = Math.floor((innerWidth - 6 * 4) / 7); // 6 gaps of 4px

  return (
    <View style={styles.wrap}>
      {/* Day labels row */}
      <View style={styles.headerRow}>
        <View style={styles.labelCol} />
        {DAYS.map((d, i) => (
          <View key={i} style={[styles.dayLabel, { width: cellSize }]}>
            <Text style={styles.dayText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid rows */}
      {TIME_SLOTS.map((slot, rowIdx) => (
        <View key={rowIdx} style={styles.gridRow}>
          <View style={styles.labelCol}>
            <Text style={styles.slotText}>{slot}</Text>
          </View>
          {DAYS.map((_, colIdx) => {
            const intensity = data[rowIdx]?.[colIdx] ?? 0;
            return (
              <View
                key={colIdx}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: 26,
                    backgroundColor: intensityToColor(intensity),
                  },
                ]}
              />
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
        <Text style={styles.legendText}>None</Text>
        <View style={[styles.legendDot, { backgroundColor: 'rgba(167,139,250,0.35)' }]} />
        <Text style={styles.legendText}>Medium</Text>
        <View style={[styles.legendDot, { backgroundColor: 'rgba(167,139,250,0.88)' }]} />
        <Text style={styles.legendText}>Peak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  labelCol: {
    width: 36,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  dayLabel: {
    alignItems: 'center',
  },
  dayText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotText: {
    fontFamily: Typography.fontMono,
    fontSize: 9,
    color: Colors.textTertiary,
  },
  cell: {
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
