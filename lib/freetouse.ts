import { api } from '../convex/_generated/api';

export interface FreeToUseTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const CATEGORY_MAP: Record<string, string> = {
  'lofi': 'cfdfdd53-195a-6b6c-bc54-d665859b445b', // Lofi
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
