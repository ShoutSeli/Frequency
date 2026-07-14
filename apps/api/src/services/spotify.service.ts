import axios from 'axios';
import { env } from '../lib/env';
import { withCache, cacheGet, cacheSet } from '../lib/cache';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  albumArtUrl?: string;
  embedUrl: string;
  externalUrl: string;
  durationMs: number;
}

async function getAccessToken(): Promise<string> {
  const cached = await cacheGet<string>('spotify:token');
  if (cached) return cached;

  if (!env.spotifyClientId || !env.spotifyClientSecret) {
    throw new Error(
      'SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are not set. Create an app at https://developer.spotify.com/dashboard'
    );
  }

  const basic = Buffer.from(`${env.spotifyClientId}:${env.spotifyClientSecret}`).toString('base64');
  const { data } = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  await cacheSet('spotify:token', data.access_token, data.expires_in - 60);
  return data.access_token;
}

function mapTrack(raw: any): SpotifyTrack {
  return {
    id: raw.id,
    name: raw.name,
    artists: raw.artists.map((a: any) => a.name),
    albumArtUrl: raw.album?.images?.[0]?.url,
    embedUrl: `https://open.spotify.com/embed/track/${raw.id}`,
    externalUrl: raw.external_urls?.spotify,
    durationMs: raw.duration_ms,
  };
}

export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  return withCache(`spotify:search:${query.toLowerCase()}`, 60 * 30, async () => {
    const token = await getAccessToken();
    const { data } = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: 'track', limit: 20 },
    });
    return (data.tracks.items as any[]).map(mapTrack);
  });
}
