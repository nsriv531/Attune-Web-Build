import { useEffect, useState, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useSessionStore } from '@/stores/sessionStore';
import { fetchTracksByCategory, FreeToUseTrack } from '@/lib/freetouse';

export function useRitualAudio() {
  const { ritualSound, isActive, isPaused } = useSessionStore();
  const [playlist, setPlaylist] = useState<FreeToUseTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch tracks whenever the selected sound category changes
  useEffect(() => {
    if (ritualSound === 'silence') {
      setPlaylist([]);
      return;
    }

    async function load() {
      setLoading(true);
      const tracks = await fetchTracksByCategory(ritualSound);
      setPlaylist(tracks);
      setCurrentIndex(0);
      setLoading(false);
    }
    load();
  }, [ritualSound]);

  const currentTrack = playlist[currentIndex];
  const player = useAudioPlayer(currentTrack?.url);

  useEffect(() => {
    if (!player || !currentTrack) return;
    player.loop = false; // We want to handle manual track switching or auto-next

    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player, currentTrack]);

  const nextTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  return {
    player,
    currentTrack,
    nextTrack,
    prevTrack,
    loading
  };
}
