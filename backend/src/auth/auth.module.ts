import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { EmailService } from './email.service';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './guards/admin.guard';
import { ConfigurationException } from '../common/exceptions/ConfigurationException';
import { LoggerModule } from 'nestjs-pino';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new ConfigurationException('JWT_SECRET environment variable is required');
        }
        return { secret };
      },
      inject: [ConfigService],
    }),
    LoggerModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    AddressesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, TokenService, JwtStrategy, AdminGuard],
  exports: [AuthService],
})
export class AuthModule {}
