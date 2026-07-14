import type { MediaItem, MoodMixerInput } from '@uwh/shared-types';
import * as tmdb from './tmdb.service';

/**
 * "Mood Mixer" — turns three feel sliders into a blended recommendation set instead of
 * traditional genre checkboxes. This is the site's signature discovery feature.
 *
 * cozyToIntense: 0 = comfort/light watching, 100 = high-tension/thriller energy
 * shortToEpic: 0 = short runtime / episodic, 100 = long epics / multi-season sagas
 * backgroundToFocused: 0 = background noise friendly, 100 = demands full attention
 */

const COZY_GENRES = ['Comedy', 'Family', 'Animation', 'Romance'];
const INTENSE_GENRES = ['Thriller', 'Horror', 'Crime', 'War', 'Action'];
const FOCUSED_GENRES = ['Mystery', 'Drama', 'Documentary', 'Science Fiction'];
const BACKGROUND_GENRES = ['Comedy', 'Reality', 'Talk', 'Music'];

function scoreItem(item: MediaItem, input: MoodMixerInput): number {
  const genres = item.genres ?? [];
  let score = 0;

  const cozyHits = genres.filter((g) => COZY_GENRES.includes(g)).length;
  const intenseHits = genres.filter((g) => INTENSE_GENRES.includes(g)).length;
  const cozyIntenseTarget = input.cozyToIntense / 100;
  score -= Math.abs(cozyIntenseTarget - (intenseHits > cozyHits ? 0.8 : cozyHits > 0 ? 0.2 : 0.5)) * 10;

  const focusedHits = genres.filter((g) => FOCUSED_GENRES.includes(g)).length;
  const backgroundHits = genres.filter((g) => BACKGROUND_GENRES.includes(g)).length;
  const focusTarget = input.backgroundToFocused / 100;
  score -= Math.abs(focusTarget - (focusedHits > backgroundHits ? 0.8 : backgroundHits > 0 ? 0.2 : 0.5)) * 10;

  if (item.runtimeMinutes) {
    const epicTarget = input.shortToEpic / 100;
    const runtimeNormalized = Math.min(item.runtimeMinutes / 180, 1); // 3hr+ = fully epic
    score -= Math.abs(epicTarget - runtimeNormalized) * 8;
  }

  score += (item.rating ?? 5) * 0.5; // slight quality boost
  return score;
}

export async function mixMood(input: MoodMixerInput): Promise<MediaItem[]> {
  const kinds = input.kinds && input.kinds.length > 0 ? input.kinds : ['movie', 'tv'];
  const pools = await Promise.all(
    kinds.map((k) => (k === 'movie' || k === 'tv' ? tmdb.discover(k) : Promise.resolve([] as MediaItem[])))
  );
  const candidates = pools.flat();

  // Enrich a capped subset with genre/runtime detail (detail calls are more expensive/cached).
  const enriched = await Promise.all(
    candidates.slice(0, 24).map(async (item) => {
      try {
        const [, type, tmdbId] = item.id.split('-');
        const detail = await tmdb.getDetail(Number(tmdbId), type === 'tv' ? 'tv' : 'movie');
        return { ...item, genres: detail.genres, runtimeMinutes: detail.runtimeMinutes };
      } catch {
        return item;
      }
    })
  );

  return enriched.sort((a, b) => scoreItem(b, input) - scoreItem(a, input)).slice(0, 12);
}
