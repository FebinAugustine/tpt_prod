import { Injectable, Inject } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string = 'redis'): Promise<HealthIndicatorResult> {
    try {
      const testKey = `health:${key}:${Date.now()}`;
      const testValue = 'ok';
      await this.cacheManager.set(testKey, testValue, 1);
      const value = await this.cacheManager.get(testKey);
      if (value === testValue) {
        return this.getStatus(key, true, { message: 'Redis connection verified' });
      }
      return this.getStatus(key, false, { message: 'Redis check failed: value mismatch' });
    } catch (error: any) {
      return this.getStatus(key, false, { message: 'Redis connection failed', error: error.message });
    }
  }
}
