import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis  from 'ioredis';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
    @InjectConnection() private connection: Connection,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns application health status',
  })
  @ApiOkResponse({ description: 'Application is healthy' })
  check() {
    return this.health.check([
      () => this.mongooseHealth.pingCheck('database', { connection: this.connection }),
      async (): Promise<HealthIndicatorResult> => {
        try {
          const redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD,
            connectTimeout: 3000,
          });
          await redis.ping();
          await redis.quit();
          return { redis: { status: 'up' } };
        } catch (error: any) {
          return { redis: { status: 'down', error: error.message } };
        }
      },
    ]);
  }
}
