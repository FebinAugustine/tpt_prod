import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorageService, ThrottlerException } from '@nestjs/throttler';
import { THROTTLE_LIMIT, THROTTLE_TTL } from '../decorators/throttle.decorator';

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly throttlerService: ThrottlerStorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get throttle metadata from handler
    const limit = this.reflector.get<number>(THROTTLE_LIMIT, context.getHandler());
    const ttl = this.reflector.get<number>(THROTTLE_TTL, context.getHandler());

    // If no throttle metadata, allow request (no limit)
    if (!limit) {
      return true;
    }

    // Generate key based on IP address
    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request);

    // Check throttler using increment method
    // blockDuration: 0 (no blocking), throttlerName: 'default' (matching app.module.ts)
    const { totalHits } = await this.throttlerService.increment(
      key,
      ttl,
      limit,
      0, // blockDuration - 0 means no blocking, just rate limiting
      'default', // throttlerName - should match the name in ThrottlerModule.forRoot
    );

    // If limit exceeded, throw exception
    if (totalHits > limit) {
      throw new ThrottlerException('Rate limit exceeded');
    }

    return true;
  }

  private generateKey(request: any): string {
    // Use IP address as key for throttling
    return request.ip;
  }
}