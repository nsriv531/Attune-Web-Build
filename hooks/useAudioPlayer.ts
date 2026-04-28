import { useEffect, useState, useRef } from 'react';
import { createAudioPlayer } from 'expo-audio';
import { useSessionStore } from '@/stores/sessionStore';
import { fetchTracksByCategory, FreeToUseTrack } from '@/lib/freetouse';
import { useConvex } from 'convex/react';

export function useRitualAudio() {
  const convex = useConvex();
  const { ritualSound, isActive, isPaused } = useSessionStore();
  const [playlist, setPlaylist] = useState<FreeToUseTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Use state for the player so React knows when it changes
  const [player, setPlayer] = useState<any>(null);

  // Fetch tracks whenever the selected sound category changes
  useEffect(() => {
    if (ritualSound === 'silence') {
      setPlaylist([]);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const tracks = await fetchTracksByCategory(convex, ritualSound);
        setPlaylist(tracks);
        setCurrentIndex(0);
      } catch (e) {
        console.error("Failed to load tracks", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ritualSound, convex]);

  const currentTrack = playlist[currentIndex];

  // Manage player instance lifecycle
  useEffect(() => {
    if (!currentTrack?.url) {
      setPlayer(null);
      return;
    }

    // Create new player
    let newPlayer: any = null;
    try {
      newPlayer = createAudioPlayer(currentTrack.url);
      newPlayer.loop = false;
      setPlayer(newPlayer);
    } catch (e) {
      console.error("Failed to create audio player", e);
    }

    return () => {
      if (newPlayer) {
        try {
          newPlayer.pause();
          // We don't explicitly call .release() or .dispose() 
          // because expo-audio's createAudioPlayer doesn't usually 
          // require it immediately, but we must ensure it's not being 
          // used anymore.
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [currentTrack?.url]);

  // Handle Play/Pause synchronization
  useEffect(() => {
    if (!player) return;

    try {
      if (isActive && !isPaused) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      console.error("Failed to sync play/pause state", e);
    }
  }, [isActive, isPaused, player]);

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
