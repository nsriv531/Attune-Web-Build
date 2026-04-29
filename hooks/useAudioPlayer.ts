import { useEffect, useState, useRef } from 'react';
import { createAudioPlayer } from 'expo-audio';
import { useSessionStore } from '@/stores/sessionStore';
import { fetchTracksByCategory, FreeToUseTrack } from '@/lib/freetouse';
import { useConvex } from 'convex/react';

const LOCAL_SOUNDS: Record<string, any> = {
  'rain': require('../assets/audio/rain.mp3'),
  'forest': require('../assets/audio/forest.mp3'),
  'white-noise': require('../assets/audio/whitenoise.mp3'),
};

export function useRitualAudio(isPreview = false) {
  const convex = useConvex();
  const { ritualSound, isActive, isPaused } = useSessionStore();
  const [playlist, setPlaylist] = useState<FreeToUseTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  
  // Track if preview should be playing (15s limit)
  const [previewTimerActive, setPreviewActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a ref to track the last sound to avoid auto-triggering on mount
  const lastSoundRef = useRef<string>(ritualSound);

  // Trigger preview when ritualSound changes in preview mode
  useEffect(() => {
    if (isPreview && ritualSound !== lastSoundRef.current && ritualSound !== 'silence' && !isActive) {
      setPreviewActive(true);
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setPreviewActive(false);
      }, 15000); // 15 seconds
    } 
    
    if (isActive || ritualSound === 'silence') {
      setPreviewActive(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    lastSoundRef.current = ritualSound;
  }, [ritualSound, isPreview, isActive]);

  // Fetch tracks for LOFI (FreeToUse)
  useEffect(() => {
    if (ritualSound !== 'lofi') {
      setPlaylist([]);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const tracks = await fetchTracksByCategory(convex, 'lofi');
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

  const currentTrack = ritualSound === 'lofi' ? playlist[currentIndex] : null;

  // Manage player lifecycle
  useEffect(() => {
    let source: any = null;

    if (ritualSound === 'silence') {
      setPlayer(null);
      return;
    }

    if (ritualSound === 'lofi') {
      if (!currentTrack?.url) return;
      source = currentTrack.url;
    } else {
      source = LOCAL_SOUNDS[ritualSound];
    }

    if (!source) return;

    let newPlayer: any = null;
    try {
      newPlayer = createAudioPlayer(source);
      // Local sounds loop, Lo-fi tracks go to next
      newPlayer.loop = ritualSound !== 'lofi';
      setPlayer(newPlayer);
    } catch (e) {
      console.error("Failed to create audio player", e);
    }

    return () => {
      if (newPlayer) {
        try {
          newPlayer.pause();
        } catch (e) {}
      }
    };
  }, [ritualSound, currentTrack?.url]);

  // Handle Play/Pause synchronization
  useEffect(() => {
    if (!player) return;

    try {
      if (isPreview) {
        // Only play if within the 15s window and session NOT active
        if (previewTimerActive && !isActive) {
          player.play();
        } else {
          player.pause();
        }
      } else {
        // Standard session behavior
        if (isActive && !isPaused) {
          player.play();
        } else {
          player.pause();
        }
      }
    } catch (e) {
      console.error("Failed to sync play/pause state", e);
    }
  }, [isActive, isPaused, player, isPreview, previewTimerActive]);

  const nextTrack = () => {
    if (ritualSound !== 'lofi' || playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    if (ritualSound !== 'lofi' || playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  return {
    player,
    currentTrack: ritualSound === 'lofi' ? currentTrack : { title: ritualSound, artist: 'Ritual Sound' },
    nextTrack,
    prevTrack,
    loading,
    previewTimerActive
  };
}
