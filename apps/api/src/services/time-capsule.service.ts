import axios from 'axios';
import { env } from '../lib/env';
import { withCache } from '../lib/cache';
import * as sports from './sports.service';
import type { MediaItem } from '@uwh/shared-types';

/**
 * "Time Capsule" — pick any date in history and see what released/topped charts/played that day.
 * Drives nostalgia-based sharing and repeat visits.
 */
export async function getTimeCapsule(dateISO: string) {
  const [year, month, day] = dateISO.split('-');

  const moviesPromise = withCache(`capsule:movies:${dateISO}`, 60 * 60 * 24, async () => {
    if (!env.tmdbApiKey) return [] as MediaItem[];
    const { data } = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: env.tmdbApiKey,
        'primary_release_date.gte': dateISO,
        'primary_release_date.lte': dateISO,
        sort_by: 'popularity.desc',
      },
      timeout: 8000,
    });
    return (data.results as any[]).slice(0, 6).map((r) => ({
      id: `tmdb-movie-${r.id}`,
      kind: 'movie' as const,
      title: r.title,
      posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
      releaseYear: Number(year),
      rating: r.vote_average,
    }));
  });

  const sportsPromise = sports.getEventsByDate(dateISO).catch(() => []);

  const [movies, sportEvents] = await Promise.all([moviesPromise, sportsPromise]);

  return {
    date: dateISO,
    movies,
    sportEvents,
    note:
      'Music chart history requires a licensed charts API (e.g. Billboard) — wire in a provider key to populate this section.',
  };
}
