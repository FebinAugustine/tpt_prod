import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsPlainString, IsSafeHtml } from '../../common/decorators/sanitize.decorator';

export class AddProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  @IsPlainString() // Prevents $ operators, ObjectId injection
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  @IsSafeHtml() // Prevents XSS
  description?: string;

  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Offer price must be a valid number' })
  @Min(0)
  @Type(() => Number)
  offerPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Trainer price must be a valid number' })
  @Min(0)
  @Type(() => Number)
  trainerPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @IsPlainString() // Prevents $ operators, ObjectId injection
  weight?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @IsPlainString() // Prevents $ operators, ObjectId injection
  serve?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isImported?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStock?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @IsPlainString() // Prevents $ operators, ObjectId injection
  flavour?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  @IsPlainString() // Prevents $ operators, ObjectId injection
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  @IsPlainString() // Prevents $ operators, ObjectId injection
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  @IsSafeHtml() // Prevents XSS
  howToUse?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  @IsSafeHtml() // Prevents XSS
  whenToUse?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsPlainString({ each: true }) // Prevents $ operators, ObjectId injection
  images?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a valid number' })
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  @Transform(({ value }) => value?.trim())
  @IsPlainString() // Prevents $ operators, ObjectId injection
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isTrending?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPopular?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRecommended?: boolean;
}
