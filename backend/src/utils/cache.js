// src/utils/cache.js
const { redisClient, connectRedis } = require('../config/redis');

const DEFAULT_TTL = 300; // 5 minutes in seconds

const ensureConnected = async () => {
  if (!redisClient.isOpen) {
    await connectRedis();
  }
};

/**
 * Get value from Redis cache
 * @param {string} key
 * @returns {any|null}
 */
const getCache = async (key) => {
  try {
    await ensureConnected();
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null; // fail silently - cache miss is acceptable
  }
};

/**
 * Set value in Redis cache
 * @param {string} key
 * @param {any} data
 * @param {number} ttl - seconds
 */
const setCache = async (key, data, ttl = DEFAULT_TTL) => {
  try {
    await ensureConnected();
    if (!redisClient.isOpen) return;
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch {
    // fail silently - writing cache is best-effort
  }
};

/**
 * Delete one or more cache keys (supports wildcard pattern via SCAN)
 * @param {string|string[]} keys
 */
const invalidateCache = async (keys) => {
  try {
    await ensureConnected();
    if (!redisClient.isOpen) return;
    const keyList = Array.isArray(keys) ? keys : [keys];
    if (keyList.length > 0) {
      await redisClient.del(keyList);
    }
  } catch {
    // fail silently
  }
};

/**
 * Invalidate all keys matching a pattern (e.g., "project:uuid:*")
 * @param {string} pattern
 */
const invalidateCachePattern = async (pattern) => {
  try {
    await ensureConnected();
    if (!redisClient.isOpen) return;
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.warn(`[Cache] Invalidation warning for pattern "${pattern}":`, err.message);
  }
};

module.exports = { getCache, setCache, invalidateCache, invalidateCachePattern };
