"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeCapsule = getTimeCapsule;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../lib/env");
const cache_1 = require("../lib/cache");
const sports = __importStar(require("./sports.service"));
/**
 * "Time Capsule" — pick any date in history and see what released/topped charts/played that day.
 * Drives nostalgia-based sharing and repeat visits.
 */
async function getTimeCapsule(dateISO) {
    const [year, month, day] = dateISO.split('-');
    const moviesPromise = (0, cache_1.withCache)(`capsule:movies:${dateISO}`, 60 * 60 * 24, async () => {
        if (!env_1.env.tmdbApiKey)
            return [];
        const { data } = await axios_1.default.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
                api_key: env_1.env.tmdbApiKey,
                'primary_release_date.gte': dateISO,
                'primary_release_date.lte': dateISO,
                sort_by: 'popularity.desc',
            },
            timeout: 8000,
        });
        return data.results.slice(0, 6).map((r) => ({
            id: `tmdb-movie-${r.id}`,
            kind: 'movie',
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
        note: 'Music chart history requires a licensed charts API (e.g. Billboard) — wire in a provider key to populate this section.',
    };
}
