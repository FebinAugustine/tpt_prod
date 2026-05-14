import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { EmailHealthIndicator } from './indicators/email.health-indicator';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';

@Module({
  imports: [
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [EmailHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}