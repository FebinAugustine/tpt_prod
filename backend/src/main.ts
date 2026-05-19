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
  // Validate environment variables before starting the application
  await validateConfig();

  const app = await NestFactory.create(AppModule);
  // Retrieve structured logger provided by LoggerModule
  const logger = app.get(Logger);

  // Apply security headers middleware
  app.use(helmet());

  // Apply correlation ID middleware globally
  app.use(new CorrelationIdMiddleware().use);

  // Add request timeout middleware (30 seconds)
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

  // Add production domain if in production
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

  // Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
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
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(app.get(HttpExceptionFilter));

  // Register response interceptor globally
  app.useGlobalInterceptors(app.get(ResponseInterceptor));

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('The Power Trainer API')
    .setDescription('API for The Power Trainer App - Protein supplement store')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Products', 'Product management')
    .addTag('Orders', 'Order management')
    .addTag('Categories', 'Category management')
    .addTag('Settings', 'Settings management')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Only enable Swagger in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { font-size: 2.5em; }
      `,
    });
  }

    // Database connection check, seeding, and server initialization sequence
  const startServer = async (retries = 5, delay = 5000) => {
    try {
      // 1. Verify database token status BEFORE opening the server port
      const connection = app.get(getConnectionToken());
      
      if (connection.readyState !== 1) {
        throw new Error('Mongoose connection readyState is not active (1)');
      }
      
      logger.log('Database connection status: Connected');

      // 2. Seed initial users safely while traffic is still paused
      await seedInitialUsers(app, logger);

      // 3. Finally, launch the server to accept traffic
      const finalPort = process.env.PORT ?? 5000;
      await app.listen(finalPort, '0.0.0.0'); // Explicitly bind host to 0.0.0.0 for stable Docker routing
      
      logger.log(`Server is running on port ${finalPort}`);
      if (process.env.NODE_ENV !== 'production') {
        logger.log(
          `Swagger docs available at http://localhost:${finalPort}/docs`,
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (retries <= 0) {
        logger.error(`Failed to initialize server after multiple attempts: ${errorMessage}`);
        throw error;
      }
      logger.warn(
        `Server startup or database connection failed. Retrying in ${delay}ms... (${retries} attempts left})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      await startServer(retries - 1, delay * 1.5); // Exponential backoff
    }
  };

  await startServer();

}

bootstrap();