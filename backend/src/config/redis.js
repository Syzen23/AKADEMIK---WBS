// src/config/redis.js
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn('⚠️ Redis connection failed. Caching will gracefully fall back to direct DB queries:', err.message);
  }
};

module.exports = { redisClient, connectRedis };
