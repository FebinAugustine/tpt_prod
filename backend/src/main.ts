import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { validateConfig } from './config/validate.config';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { Logger } from 'nestjs-pino';
import { Model } from 'mongoose';
import { User, UserDocument } from './auth/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

// Initial users to seed
const INITIAL_USERS = [
  {
    fullName: 'Admin User',
    email: 'supporttpt@gmail.com',
    password: 'AdminTpt@2026',
    role: 'admin',
    isVerified: true,
  },
  {
    fullName: 'Test User',
    email: 'tpttest@gmail.com',
    password: 'Tpttest@2026',
    role: 'user',
    isVerified: true,
  },
];

async function seedInitialUsers(app: any, logger: any) {
  const userModel = app.get(getModelToken(User.name)) as Model<UserDocument>;
  
  const userCount = await userModel.countDocuments();
  
  if (userCount > 0) {
    logger.log(`Found ${userCount} existing users. Skipping seeder.`);
    return;
  }
  
  logger.log('No users found. Seeding initial users...');
  
  for (const userData of INITIAL_USERS) {
    try {
      const existingUser = await userModel.findOne({ email: userData.email });
      if (existingUser) {
        continue;
      }
      
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await userModel.create({
        fullName: userData.fullName,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isVerified: userData.isVerified,
        refreshTokens: [],
      });
      
      logger.log(`Created ${userData.role} user: ${userData.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create user ${userData.email}: ${errorMessage}`);
    }
  }
  
  logger.log('Initial seeding completed.');
}

async function bootstrap() {
  // 1. Validate config before booting anything
  await validateConfig();

  // 2. Instantiate Nest with an empty options block to let Pino attach cleanly
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  
  // 3. Extract and assign the Pino logger instance safely
  const logger = app.get(Logger);
  app.useLogger(logger);

  // 4. CRITICAL FIX: Tell Express to trust Traefik's proxy headers
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(helmet());
  app.use(new CorrelationIdMiddleware().use);

  // Request timeout middleware
  app.use((req: any, res: any, next: any) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: 'Request timeout' });
      }
    }, 25000);
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    next();
  });

  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000,http://localhost:3001'
  ).split(',');

  if (process.env.NODE_ENV === 'production') {
    allowedOrigins.push('https://thepowertrainer.cloud');
    allowedOrigins.push('https://www.thepowertrainer.cloud');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 5. CRITICAL FIX: HTTPS redirect checking working with proxy headers
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
      }
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    });
  }

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(app.get(HttpExceptionFilter));
  app.useGlobalInterceptors(app.get(ResponseInterceptor));
  app.use(cookieParser());

  // Database connection check & server initialization
    // Database connection check, seeding, and server initialization sequence
  const startServer = async (retries = 10, delay = 3000) => {
    try {
      // 1. Safe extraction of logger with standard fallback
      let customLogger: any = console;
      try {
        if (process.env.NODE_ENV !== 'production' || !app.getHttpServer()) {
          customLogger = app.get(Logger);
        }
      } catch {
        customLogger = console; // Use standard node console if Pino isn't fully mounted
      }

      // 2. CRITICAL FIX: If running in preview mode, don't execute database queries
      // This prevents the application context preview engine from crashing
      const expressApp = app.getHttpAdapter().getInstance();
      if (!expressApp) {
        console.log('👉 App running in context preview optimization mode. Skipping DB connection checks.');
        return;
      }

      const connection = app.get(getConnectionToken());
      
      // readyState descriptions: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (connection.readyState !== 1 && connection.readyState !== 2) {
        throw new Error(`Mongoose socket connection state is not active (ReadyState: ${connection.readyState})`);
      }
      
      customLogger.log('Database connection status: Connected');

      // 3. Seed initial users safely while traffic is still paused
      await seedInitialUsers(app, customLogger);

      // 4. Finally, launch the server to accept traffic
      const finalPort = process.env.PORT ?? 5000;
      await app.listen(finalPort, '0.0.0.0'); 
      
      customLogger.log(`Server is running on port ${finalPort}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Safe logging fallback to guarantee the real error is printed onto the terminal screen
      console.error(`⚠️ Startup Check Failed: ${errorMessage}`);
      
      if (retries <= 0) {
        console.error(`❌ Fatal: Failed to initialize server after multiple attempts.`);
        throw error;
      }
      
      console.warn(`🔄 Retrying infrastructure handshake in ${delay}ms... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      await startServer(retries - 1, delay); 
    }
  };


  await startServer();
}
bootstrap();
