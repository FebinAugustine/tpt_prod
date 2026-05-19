import { Injectable, Inject } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string = 'redis', timeoutMs: number = 3000): Promise<HealthIndicatorResult> {
    try {
      const testKey = `health:${key}:${Date.now()}`;
      const testValue = 'ok';
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis timeout')), timeoutMs)
      );
      
      await Promise.race([
        this.cacheManager.set(testKey, testValue, 1),
        timeoutPromise,
      ]);
      
      const value = await Promise.race([
        this.cacheManager.get(testKey),
        timeoutPromise,
      ]);
      
      if (value === testValue) {
        return this.getStatus(key, true, { message: 'Redis connection verified' });
      }
      return this.getStatus(key, false, { message: 'Redis check failed: value mismatch' });
    } catch (error: any) {
      return this.getStatus(key, false, { message: 'Redis connection failed', error: error.message });
    }
  }
}
