import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { UIManagerModule } from './uimanager/uimanager.module';
import { OrdersModule } from './orders/orders.module';
import { SettingsModule } from './settings/settings.module';
import { AddressesModule } from './addresses/addresses.module';
import { CareersModule } from './careers/careers.module';
import { PressModule } from './press/press.module';
import { HealthModule } from './health/health.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { LoggingModule } from './common/modules/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          try {
            const { redisStore } = await import('cache-manager-redis-store');
            return {
              store: redisStore,
              host: configService.get<string>('REDIS_HOST', 'localhost'),
              port: configService.get<number>('REDIS_PORT', 6379),
              password: configService.get<string>('REDIS_PASSWORD'),
              ttl: 300,
            };
          } catch {
            return {
              ttl: 300,
            };
          }
        }
        return {
          ttl: 300,
        };
      },
      inject: [ConfigService],
    }),
    TerminusModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60,
        limit: 100,
      },
      {
        name: 'strict',
        ttl: 60,
        limit: 5,
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        ...configService.get('database.options'),
      }),
      inject: [ConfigService],
    }),
    LoggingModule.forRoot(),
    HealthModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    UIManagerModule,
    OrdersModule,
    SettingsModule,
    AddressesModule,
    CareersModule,
    PressModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: ThrottlerGuard,
      useClass: ThrottlerGuard,
    },
    ResponseInterceptor,
    HttpExceptionFilter,
  ],
})
export class AppModule {}