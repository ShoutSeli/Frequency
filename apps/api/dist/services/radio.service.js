"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchStations = searchStations;
exports.stationsByCountry = stationsByCountry;
exports.topStations = topStations;
exports.stationsByTag = stationsByTag;
const axios_1 = __importDefault(require("axios"));
const cache_1 = require("../lib/cache");
// Radio-Browser: free, open, community-maintained directory of legal internet radio streams.
// https://api.radio-browser.info — no API key required.
const RADIO_BROWSER_BASE = 'https://de1.api.radio-browser.info/json';
function mapStation(raw) {
    return {
        id: raw.stationuuid,
        name: raw.name,
        country: raw.country,
        language: raw.language,
        tags: (raw.tags ?? '').split(',').filter(Boolean),
        streamUrl: raw.url_resolved || raw.url,
        favicon: raw.favicon || undefined,
        bitrate: raw.bitrate,
    };
}
async function searchStations(query, limit = 30) {
    return (0, cache_1.withCache)(`radio:search:${query.toLowerCase()}:${limit}`, 60 * 30, async () => {
        const { data } = await axios_1.default.get(`${RADIO_BROWSER_BASE}/stations/search`, {
            params: { name: query, limit, hidebroken: true, order: 'clickcount', reverse: true },
            timeout: 8000,
        });
        return data.map(mapStation);
    });
}
async function stationsByCountry(country, limit = 30) {
    return (0, cache_1.withCache)(`radio:country:${country.toLowerCase()}:${limit}`, 60 * 60, async () => {
        const { data } = await axios_1.default.get(`${RADIO_BROWSER_BASE}/stations/bycountry/${encodeURIComponent(country)}`, {
            params: { limit, hidebroken: true, order: 'clickcount', reverse: true },
            timeout: 8000,
        });
        return data.map(mapStation);
    });
}
async function topStations(limit = 40) {
    return (0, cache_1.withCache)(`radio:top:${limit}`, 60 * 60, async () => {
        const { data } = await axios_1.default.get(`${RADIO_BROWSER_BASE}/stations/topclick/${limit}`, {
            timeout: 8000,
        });
        return data.map(mapStation);
    });
}
async function stationsByTag(tag, limit = 30) {
    return (0, cache_1.withCache)(`radio:tag:${tag.toLowerCase()}:${limit}`, 60 * 60, async () => {
        const { data } = await axios_1.default.get(`${RADIO_BROWSER_BASE}/stations/bytag/${encodeURIComponent(tag)}`, {
            params: { limit, hidebroken: true, order: 'clickcount', reverse: true },
            timeout: 8000,
        });
        return data.map(mapStation);
    });
}
