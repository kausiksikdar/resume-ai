const { redisClient } = require('../config/redis');

async function getOrSetCache(key, fetcher, ttl = 300) {
  try {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.warn('Redis get error, skipping cache:', err.message);
  }
  const fresh = await fetcher();
  try {
    await redisClient.setex(key, ttl, JSON.stringify(fresh));
  } catch (err) {
    console.warn('Redis set error:', err.message);
  }
  return fresh;
}

async function invalidateCache(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(keys);
  } catch (err) {
    console.warn('Cache invalidation error:', err.message);
  }
}

module.exports = { getOrSetCache, invalidateCache };