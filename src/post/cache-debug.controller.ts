import { Controller, Get } from '@nestjs/common';
import Redis from 'ioredis'; // Directly using ioredis for Redis operations

@Controller('cache-debug')
export class CacheDebugController {

  /** GET /cache-debug — set once, read afterwards */
  @Get()
  async keyCheck() {
    const key = 'test_key_new';
    const ttlSec = 120; // 2 min TTL

    // Direct access to Redis via ioredis (Raw Redis client)
    const redis = new Redis({
      host: '127.0.0.1',  // Use your Redis host here
      port: 6379,         // Default Redis port
    });

    // Try to get the value from Redis
    let value = await redis.get(key);
    const hitBefore = value !== null;

    // If the key doesn't exist, set it using ioredis
    if (!hitBefore) {
      value = 'redis works!';
      await redis.set(key, value, 'EX', ttlSec);  // Set in Redis with TTL
    }

    // Close the Redis connection after use
    await redis.quit();

    // Return whether it was a hit or a miss, and the value
    return { hitBefore, value };
  }

  /** GET /cache-debug/raw — direct Redis proof */
  @Get('raw')
  async raw() {
    // Direct access to Redis via ioredis
    const redis = new Redis({
      host: '127.0.0.1',  // Use your Redis host here
      port: 6379,         // Default Redis port
    });

    // Write directly to Redis (set 'redis works!' in Redis)
    const key = 'test_key';
    const ttlSec = 120; // 2 min TTL
    await redis.set(key, 'redis works!', 'EX', ttlSec);  // Set directly with TTL

    // Ping Redis to check if it's alive
    const ping = await redis.ping();

    // Get the value of 'test_key' stored in Redis
    const rawValue = await redis.get('test_key');
    const keyType = await redis.type('test_key');
    const ttlSeconds = await redis.ttl('test_key');

    // Close the Redis connection after use
    await redis.quit();

    return {
      redisClientFound: true,
      ping,            // Should return "PONG"
      rawValue,        // Should match 'redis works!' if set properly
      keyType,         // Type of the Redis key (likely 'string')
      ttlSeconds,      // Remaining TTL in seconds
    };
  }
}