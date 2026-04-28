import { api } from '../convex/_generated/api';

export interface FreeToUseTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const CATEGORY_MAP: Record<string, string> = {
  'lofi-rain': 'cfdfdd53-195a-6b6c-bc54-d665859b445b', // Lofi
  'forest': '5a72fd26-e5be-9a3a-b0db-90ea2400a833',    // Nature
  'white-noise': 'b5bc7541-bdc2-d42a-3986-572fddd29753', // Ambient
};

export async function fetchTracksByCategory(convex: any, categoryKey: string, limit = 10): Promise<FreeToUseTrack[]> {
  const categoryId = CATEGORY_MAP[categoryKey];
  if (!categoryId) return [];

  try {
    const json = await convex.action(api.spotify.proxyTracks, { categoryId, limit });

    if (!json.ok) return [];

    return json.data.map((track: any) => ({
      id: track.id,
      title: track.title,
      artist: track.artists?.[0]?.[1]?.name || 'Unknown Artist',
      url: track.files.mp3,
    }));
  } catch (error) {
    console.error('Error fetching tracks via Convex proxy:', error);
    return [];
  }
}
