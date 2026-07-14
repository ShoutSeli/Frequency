import Redis from 'ioredis';
import { env } from './env';

// In-memory fallback so local dev works even without Redis running.
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

let redisClient: Redis | null = null;
if (env.redisUrl) {
  try {
    redisClient = new Redis(env.redisUrl, {
      lazyConnect: true,
      retryStrategy: () => null, // don't hang retrying if redis isn't up
      maxRetriesPerRequest: 1,
    });
    redisClient.connect().catch(() => {
      console.warn('[cache] Redis unreachable, falling back to in-memory cache.');
      redisClient = null;
    });
  } catch {
    redisClient = null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (redisClient && redisClient.status === 'ready') {
      const raw = await redisClient.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
  } catch {
    /* fall through to memory */
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const serialized = JSON.stringify(value);
  try {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
      return;
    }
  } catch {
    /* fall through to memory */
  }
  memoryStore.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Wraps an async fetcher with cache-aside behavior. */
export async function withCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}
