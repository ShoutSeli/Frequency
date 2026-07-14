"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMulti = searchMulti;
exports.discover = discover;
exports.trending = trending;
exports.getWatchProviders = getWatchProviders;
exports.getDetail = getDetail;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../lib/env");
const cache_1 = require("../lib/cache");
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
function client() {
    if (!env_1.env.tmdbApiKey) {
        throw new Error('TMDB_API_KEY is not set. Get a free key at https://www.themoviedb.org/settings/api and add it to apps/api/.env');
    }
    return axios_1.default.create({
        baseURL: TMDB_BASE,
        params: { api_key: env_1.env.tmdbApiKey },
        timeout: 8000,
    });
}
function toPosterUrl(path) {
    return path ? `${IMG_BASE}/w500${path}` : undefined;
}
function toBackdropUrl(path) {
    return path ? `${IMG_BASE}/w1280${path}` : undefined;
}
function mapKind(mediaType, isAnimeHint) {
    if (isAnimeHint)
        return 'anime';
    if (mediaType === 'tv')
        return 'tv';
    return 'movie';
}
function mapItem(raw, kindHint) {
    const isAnime = kindHint === 'anime' ||
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
async function searchMulti(query) {
    return (0, cache_1.withCache)(`tmdb:search:${query.toLowerCase()}`, 60 * 30, async () => {
        const { data } = await client().get('/search/multi', { params: { query, include_adult: false } });
        return data.results
            .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
            .map((r) => mapItem(r));
    });
}
async function discover(kind) {
    return (0, cache_1.withCache)(`tmdb:discover:${kind}`, 60 * 60, async () => {
        const c = client();
        if (kind === 'anime') {
            const { data } = await c.get('/discover/tv', {
                params: { with_genres: 16, with_origin_country: 'JP', sort_by: 'popularity.desc' },
            });
            return data.results.map((r) => mapItem(r, 'anime'));
        }
        if (kind === 'documentary') {
            const { data } = await c.get('/discover/movie', {
                params: { with_genres: 99, sort_by: 'popularity.desc' },
            });
            return data.results.map((r) => mapItem(r, 'documentary'));
        }
        if (kind === 'telenovela') {
            // Telenovelas map best to TMDB TV "Soap" genre (id 10766) filtered to Spanish/Portuguese language origin.
            const { data } = await c.get('/discover/tv', {
                params: { with_genres: 10766, with_original_language: 'es', sort_by: 'popularity.desc' },
            });
            return data.results.map((r) => mapItem(r, 'telenovela'));
        }
        const path = kind === 'tv' ? '/discover/tv' : '/discover/movie';
        const { data } = await c.get(path, { params: { sort_by: 'popularity.desc' } });
        return data.results.map((r) => mapItem(r, kind));
    });
}
async function trending() {
    return (0, cache_1.withCache)('tmdb:trending', 60 * 30, async () => {
        const { data } = await client().get('/trending/all/week');
        return data.results
            .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
            .map((r) => mapItem(r));
    });
}
async function getWatchProviders(id, type, region = 'US') {
    return (0, cache_1.withCache)(`tmdb:providers:${type}:${id}:${region}`, 60 * 60 * 6, async () => {
        const { data } = await client().get(`/${type}/${id}/watch/providers`);
        const regionData = data.results?.[region];
        if (!regionData)
            return [];
        const providers = [];
        const push = (list, providerType) => {
            (list ?? []).forEach((p) => {
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
async function getDetail(id, type) {
    return (0, cache_1.withCache)(`tmdb:detail:${type}:${id}`, 60 * 60, async () => {
        const { data } = await client().get(`/${type}/${id}`);
        const item = mapItem({ ...data, media_type: type });
        item.genres = (data.genres ?? []).map((g) => g.name);
        item.runtimeMinutes = data.runtime ?? data.episode_run_time?.[0];
        item.providers = await getWatchProviders(id, type);
        return item;
    });
}
