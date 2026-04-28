import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useAudioPlayerStatus } from 'expo-audio';
import type { FreeToUseTrack } from '@/lib/freetouse';

interface MediaPlayerProps {
  player: any;
  track: FreeToUseTrack | null;
  onNext: () => void;
  onPrev: () => void;
  loading?: boolean;
}

export function MediaPlayer({ player, track, onNext, onPrev, loading }: MediaPlayerProps) {
  const status = useAudioPlayerStatus(player);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.purple} />
        <Text style={styles.loadingText}>Fetching ritual sounds...</Text>
      </View>
    );
  }

  if (!player || !track) return null;

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
      </View>
      
      <View style={styles.controls}>
        <Pressable onPress={onPrev} style={styles.btn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={Colors.textSecondary} strokeWidth={2}>
            <Path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </Svg>
        </Pressable>

        <Pressable onPress={togglePlay} style={styles.playBtn}>
          {status.playing ? (
            <Svg width={32} height={32} viewBox="0 0 24 24" fill={Colors.purple}>
              <Path d="M6 4h4v16H6zm8 0h4v16h-4z" />
            </Svg>
          ) : (
            <Svg width={32} height={32} viewBox="0 0 24 24" fill={Colors.purple}>
              <Path d="M8 5v14l11-7z" />
            </Svg>
          )}
        </Pressable>

        <Pressable onPress={onNext} style={styles.btn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={Colors.textSecondary} strokeWidth={2}>
            <Path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  info: {
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  artist: {
    fontFamily: Typography.fontMono,
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  loadingText: {
    fontFamily: Typography.fontMono,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  btn: {
    padding: Spacing.sm,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(167,139,250,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
