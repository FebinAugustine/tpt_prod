import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsPlainString } from '../../common/decorators/sanitize.decorator';

export class AddOfferCardDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @IsPlainString()
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsPlainString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  @IsPlainString()
  image?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsPlainString()
  buttonText?: string;

  @IsString()
  @IsOptional()
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
