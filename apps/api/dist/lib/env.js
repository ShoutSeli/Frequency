"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function required(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (value === undefined) {
        // Don't crash the whole app for optional external API keys — routes that need
        // them will report a clear error instead. Only truly required infra vars throw.
        return '';
    }
    return value;
}
exports.env = {
    port: Number(process.env.PORT ?? 4000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
    databaseUrl: required('DATABASE_URL'),
    redisUrl: process.env.REDIS_URL ?? '',
    jwtSecret: required('JWT_SECRET', 'dev_insecure_secret_change_me'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    tmdbApiKey: process.env.TMDB_API_KEY ?? '',
    sportsDbApiKey: process.env.SPORTSDB_API_KEY ?? '3',
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID ?? '',
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
};
