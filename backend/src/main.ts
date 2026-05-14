import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { getConnectionToken } from '@nestjs/mongoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { validateConfig } from './config/validate.config';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { Logger } from 'nestjs-pino';

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

  // Database connection with retry logic
  const startServer = async (retries = 5, delay = 5000) => {
    try {
      await app.listen(process.env.PORT ?? 5000);
      logger.log(`Server is running on port ${process.env.PORT ?? 5000}`);
      if (process.env.NODE_ENV !== 'production') {
        logger.log(
          `Swagger docs available at http://localhost:${process.env.PORT ?? 5000}/docs`,
        );
      }

      const connection = app.get(getConnectionToken());
      logger.log(
        `Database connection status: ${connection.readyState === 1 ? 'Connected' : 'Not connected'}`,
      );
    } catch (error) {
      if (retries <= 0) {
        logger.error(`Failed to connect to database after multiple attempts: ${error.message}`);
        throw error;
      }
      logger.warn(
        `Database connection failed. Retrying in ${delay}ms... (${retries} attempts left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      await startServer(retries - 1, delay * 1.5); // Exponential backoff
    }
  };

  await startServer();
}

bootstrap();