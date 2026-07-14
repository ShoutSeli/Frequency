import axios from 'axios';
import { env } from '../lib/env';
import { withCache } from '../lib/cache';
import type { MediaItem, MediaKind, WatchProvider } from '@uwh/shared-types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

function client() {
  if (!env.tmdbApiKey) {
    throw new Error(
      'TMDB_API_KEY is not set. Get a free key at https://www.themoviedb.org/settings/api and add it to apps/api/.env'
    );
  }
  return axios.create({
    baseURL: TMDB_BASE,
    params: { api_key: env.tmdbApiKey },
    timeout: 8000,
  });
}

function toPosterUrl(path: string | null): string | undefined {
  return path ? `${IMG_BASE}/w500${path}` : undefined;
}
function toBackdropUrl(path: string | null): string | undefined {
  return path ? `${IMG_BASE}/w1280${path}` : undefined;
}

type TmdbRawResult = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  origin_country?: string[];
  original_language?: string;
  media_type?: string;
};

function mapKind(mediaType: string | undefined, isAnimeHint: boolean): MediaKind {
  if (isAnimeHint) return 'anime';
  if (mediaType === 'tv') return 'tv';
  return 'movie';
}

function mapItem(raw: TmdbRawResult, kindHint?: MediaKind): MediaItem {
  const isAnime =
    kindHint === 'anime' ||
    (raw.original_language === 'ja' && (raw.genre_ids ?? []).includes(16));
  const kind = kindHint ?? mapKind(raw.media_type, isAnime);
  const year = (raw.release_date ?? raw.first_air_date ?? '').slice(0, 4);
  return {
    id: `tmdb-${kind === 'tv' || kind === 'anime' ? 'tv' : 'movie'}-${raw.id}`,
    kind,
    title: raw.title ?? raw.name ?? 'Untitled',
    overview: raw.overview,
    posterUrl: toPosterUrl(raw.poster_path),
    backdropUrl: toBackdropUrl(raw.backdrop_path),
    releaseYear: year ? Number(year) : undefined,
    rating: raw.vote_average,
    language: raw.original_language,
  };
}

export async function searchMulti(query: string): Promise<MediaItem[]> {
  return withCache(`tmdb:search:${query.toLowerCase()}`, 60 * 30, async () => {
    const { data } = await client().get('/search/multi', { params: { query, include_adult: false } });
    return (data.results as TmdbRawResult[])
      .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
      .map((r) => mapItem(r));
  });
}

export async function discover(kind: 'movie' | 'tv' | 'anime' | 'documentary' | 'telenovela'): Promise<MediaItem[]> {
  return withCache(`tmdb:discover:${kind}`, 60 * 60, async () => {
    const c = client();
    if (kind === 'anime') {
      const { data } = await c.get('/discover/tv', {
        params: { with_genres: 16, with_origin_country: 'JP', sort_by: 'popularity.desc' },
      });
      return (data.results as TmdbRawResult[]).map((r) => mapItem(r, 'anime'));
    }
    if (kind === 'documentary') {
      const { data } = await c.get('/discover/movie', {
        params: { with_genres: 99, sort_by: 'popularity.desc' },
      });
      return (data.results as TmdbRawResult[]).map((r) => mapItem(r, 'documentary'));
    }
    if (kind === 'telenovela') {
      // Telenovelas map best to TMDB TV "Soap" genre (id 10766) filtered to Spanish/Portuguese language origin.
      const { data } = await c.get('/discover/tv', {
        params: { with_genres: 10766, with_original_language: 'es', sort_by: 'popularity.desc' },
      });
      return (data.results as TmdbRawResult[]).map((r) => mapItem(r, 'telenovela'));
    }
    const path = kind === 'tv' ? '/discover/tv' : '/discover/movie';
    const { data } = await c.get(path, { params: { sort_by: 'popularity.desc' } });
    return (data.results as TmdbRawResult[]).map((r) => mapItem(r, kind));
  });
}

export async function trending(): Promise<MediaItem[]> {
  return withCache('tmdb:trending', 60 * 30, async () => {
    const { data } = await client().get('/trending/all/week');
    return (data.results as TmdbRawResult[])
      .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
      .map((r) => mapItem(r));
  });
}

export async function getWatchProviders(
  id: number,
  type: 'movie' | 'tv',
  region = 'US'
): Promise<WatchProvider[]> {
  return withCache(`tmdb:providers:${type}:${id}:${region}`, 60 * 60 * 6, async () => {
    const { data } = await client().get(`/${type}/${id}/watch/providers`);
    const regionData = data.results?.[region];
    if (!regionData) return [];
    const providers: WatchProvider[] = [];
    const push = (list: any[] | undefined, providerType: WatchProvider['type']) => {
      (list ?? []).forEach((p: any) => {
        providers.push({
          id: p.provider_id,
          name: p.provider_name,
          logoUrl: p.logo_path ? `${IMG_BASE}/w92${p.logo_path}` : '',
          type: providerType,
          deepLinkUrl: regionData.link,
        });
      });
    };
    push(regionData.flatrate, 'stream');
    push(regionData.free, 'free');
    push(regionData.rent, 'rent');
    push(regionData.buy, 'buy');
    return providers;
  });
}

export async function getDetail(id: number, type: 'movie' | 'tv'): Promise<MediaItem> {
  return withCache(`tmdb:detail:${type}:${id}`, 60 * 60, async () => {
    const { data } = await client().get(`/${type}/${id}`);
    const item = mapItem({ ...data, media_type: type });
    item.genres = (data.genres ?? []).map((g: any) => g.name);
    item.runtimeMinutes = data.runtime ?? data.episode_run_time?.[0];
    item.providers = await getWatchProviders(id, type);
    return item;
  });
}
