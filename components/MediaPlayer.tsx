import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAudioPlayerStatus } from 'expo-audio';
import type { FreeToUseTrack } from '@/lib/freetouse';

interface MediaPlayerProps {
  player: any;
  track: FreeToUseTrack | null;
  onNext: () => void;
  onPrev: () => void;
  loading?: boolean;
}

/**
 * Presenter component that safely uses the audio status hook
 */
function MediaPlayerContent({ player, track, onNext, onPrev }: { player: any, track: FreeToUseTrack, onNext: () => void, onPrev: () => void }) {
  const C = useThemeColors();
  const status = useAudioPlayerStatus(player);

  if (!player) return null;

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const trackTitle = track.title === 'white-noise' ? 'White Noise' : track.title.charAt(0).toUpperCase() + track.title.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF', borderColor: '#F2EBE5', borderWidth: 1 }]}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: C.textPrimary }]} numberOfLines={1}>{trackTitle}</Text>
        <Text style={[styles.artist, { color: C.textSecondary }]} numberOfLines={1}>{track.artist}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onPrev} style={styles.btn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth={2}>
            <Path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </Svg>
        </Pressable>

        <Pressable onPress={togglePlay} style={[styles.playBtn, { backgroundColor: C.amberDim }]}>
          {status.playing ? (
            <Svg width={32} height={32} viewBox="0 0 24 24" fill={C.amber}>
              <Path d="M6 4h4v16H6zm8 0h4v16h-4z" />
            </Svg>
          ) : (
            <Svg width={32} height={32} viewBox="0 0 24 24" fill={C.amber}>
              <Path d="M8 5v14l11-7z" />
            </Svg>
          )}
        </Pressable>

        <Pressable onPress={onNext} style={styles.btn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth={2}>
            <Path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

export function MediaPlayer({ player, track, onNext, onPrev, loading }: MediaPlayerProps) {
  const C = useThemeColors();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: `${C.textHint}` }]}>
        <ActivityIndicator color={C.purple} size="small" />
        <Text style={[styles.loadingText, { color: C.textSecondary }]}>Fetching ritual sounds...</Text>
      </View>
    );
  }

  if (!player || !track) {
    return null;
  }

  return <MediaPlayerContent player={player} track={track} onNext={onNext} onPrev={onPrev} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  },
  artist: {
    fontFamily: Typography.fontMono,
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  loadingText: {
    fontFamily: Typography.fontMono,
    fontSize: 10,
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
