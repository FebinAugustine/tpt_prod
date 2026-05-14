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
import { IsPlainString, IsSafeHtml } from '../../common/decorators/sanitize.decorator';

export class AddCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @IsPlainString()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  @IsSafeHtml()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a valid number' })
  @Type(() => Number)
  sortOrder?: number;
}
