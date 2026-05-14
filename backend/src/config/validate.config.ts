import { plainToInstance } from 'class-transformer';
import { validate, IsString, IsNumberString, IsOptional } from 'class-validator';
import { ConfigurationException } from '../common/exceptions/ConfigurationException';

export class AppConfig {
  @IsString()
  readonly PORT: string;

  @IsString()
  readonly MONGODB_URI: string;

  @IsString()
  readonly JWT_SECRET: string;

  @IsString()
  readonly JWT_REFRESH_SECRET: string;

  @IsOptional()
  @IsString()
  readonly CORS_ORIGINS: string;

  @IsOptional()
  @IsString()
  readonly NODE_ENV: string;

  @IsOptional()
  @IsString()
  readonly REDIS_HOST: string;

  @IsOptional()
  @IsNumberString()
  readonly REDIS_PORT: string;

  @IsOptional()
  @IsString()
  readonly SMTP_HOST: string;

  @IsOptional()
  @IsNumberString()
  readonly SMTP_PORT: string;

  @IsOptional()
  @IsString()
  readonly SMTP_USER: string;

  @IsOptional()
  @IsString()
  readonly SMTP_PASS: string;

  @IsOptional()
  @IsString()
  readonly LOG_LEVEL: string;

  @IsOptional()
  @IsString()
  readonly LOG_DIRECTORY: string;

  @IsOptional()
  @IsNumberString()
  readonly LOG_RETENTION_DAYS: string;

  @IsOptional()
  @IsString()
  readonly LOG_ROTATION_INTERVAL: string;

  @IsOptional()
  @IsString()
  readonly LOG_CONSOLE_ENABLED: string;
}

export async function validateConfig(): Promise<void> {
  const config = plainToInstance(AppConfig, process.env);
  const errors = await validate(config);

  if (errors.length > 0) {
    const errorMessages = errors.map(
      (error) =>
        `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`,
    );
    throw new ConfigurationException(
      `Invalid configuration: ${errorMessages.join('; ')}`,
    );
  }
}