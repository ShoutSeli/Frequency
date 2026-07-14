"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTracks = searchTracks;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../lib/env");
const cache_1 = require("../lib/cache");
async function getAccessToken() {
    const cached = await (0, cache_1.cacheGet)('spotify:token');
    if (cached)
        return cached;
    if (!env_1.env.spotifyClientId || !env_1.env.spotifyClientSecret) {
        throw new Error('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are not set. Create an app at https://developer.spotify.com/dashboard');
    }
    const basic = Buffer.from(`${env_1.env.spotifyClientId}:${env_1.env.spotifyClientSecret}`).toString('base64');
    const { data } = await axios_1.default.post('https://accounts.spotify.com/api/token', new URLSearchParams({ grant_type: 'client_credentials' }), { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
    await (0, cache_1.cacheSet)('spotify:token', data.access_token, data.expires_in - 60);
    return data.access_token;
}
function mapTrack(raw) {
    return {
        id: raw.id,
        name: raw.name,
        artists: raw.artists.map((a) => a.name),
        albumArtUrl: raw.album?.images?.[0]?.url,
        embedUrl: `https://open.spotify.com/embed/track/${raw.id}`,
        externalUrl: raw.external_urls?.spotify,
        durationMs: raw.duration_ms,
    };
}
async function searchTracks(query) {
    return (0, cache_1.withCache)(`spotify:search:${query.toLowerCase()}`, 60 * 30, async () => {
        const token = await getAccessToken();
        const { data } = await axios_1.default.get('https://api.spotify.com/v1/search', {
            headers: { Authorization: `Bearer ${token}` },
            params: { q: query, type: 'track', limit: 20 },
        });
        return data.tracks.items.map(mapTrack);
    });
}
