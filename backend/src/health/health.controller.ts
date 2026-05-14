import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { EmailHealthIndicator } from './indicators/email.health-indicator';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
constructor(
  private health: HealthCheckService,
  private mongooseHealth: MongooseHealthIndicator,
  private redisHealth: RedisHealthIndicator,
  private emailHealth: EmailHealthIndicator,
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
      () =>
        this.mongooseHealth.pingCheck('database', {
          connection: this.connection,
        }),
      () => this.redisHealth.isHealthy('redis'),
      () => this.emailHealth.isHealthy('email'),
    ]);
  }
}
