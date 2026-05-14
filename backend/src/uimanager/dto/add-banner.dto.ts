import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsPlainString } from '../../common/decorators/sanitize.decorator';

export class AddBannerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  @IsPlainString()
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  @IsPlainString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsPlainString()
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @IsPlainString()
  buttonText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsPlainString()
  buttonLink?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a valid number' })
  @Type(() => Number)
  sortOrder?: number;
}
