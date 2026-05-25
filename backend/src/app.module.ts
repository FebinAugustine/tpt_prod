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
import { BackupModule } from './backup/backup.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { LoggingModule } from './common/modules/logging.module';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    // 2. Replace your old CacheModule block with this async production setup:
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'redis';
        const port = parseInt(configService.get<string>('REDIS_PORT') || '6379', 10);
        const password = configService.get<string>('REDIS_PASSWORD');

        const storeConfig: any = {
          socket: {
            host,
            port,
          },
          ttl: 300 * 1000,
        };

        if (password) {
          storeConfig.password = password;
        }

        return {
          store: await redisStore(storeConfig),
        };
      },
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
    BackupModule,
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