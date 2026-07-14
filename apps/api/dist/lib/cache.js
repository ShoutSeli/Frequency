"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.withCache = withCache;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
// In-memory fallback so local dev works even without Redis running.
const memoryStore = new Map();
let redisClient = null;
if (env_1.env.redisUrl) {
    try {
        redisClient = new ioredis_1.default(env_1.env.redisUrl, {
            lazyConnect: true,
            retryStrategy: () => null, // don't hang retrying if redis isn't up
            maxRetriesPerRequest: 1,
        });
        redisClient.connect().catch(() => {
            console.warn('[cache] Redis unreachable, falling back to in-memory cache.');
            redisClient = null;
        });
    }
    catch {
        redisClient = null;
    }
}
async function cacheGet(key) {
    try {
        if (redisClient && redisClient.status === 'ready') {
            const raw = await redisClient.get(key);
            return raw ? JSON.parse(raw) : null;
        }
    }
    catch {
        /* fall through to memory */
    }
    const entry = memoryStore.get(key);
    if (!entry)
        return null;
    if (Date.now() > entry.expiresAt) {
        memoryStore.delete(key);
        return null;
    }
    return JSON.parse(entry.value);
}
async function cacheSet(key, value, ttlSeconds) {
    const serialized = JSON.stringify(value);
    try {
        if (redisClient && redisClient.status === 'ready') {
            await redisClient.set(key, serialized, 'EX', ttlSeconds);
            return;
        }
    }
    catch {
        /* fall through to memory */
    }
    memoryStore.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
}
/** Wraps an async fetcher with cache-aside behavior. */
async function withCache(key, ttlSeconds, fetcher) {
    const cached = await cacheGet(key);
    if (cached !== null)
        return cached;
    const fresh = await fetcher();
    await cacheSet(key, fresh, ttlSeconds);
    return fresh;
}
