import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255)
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @IsOptional()
  @IsEnum(['user', 'admin'], { message: 'Role must be either user or admin' })
  role?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
