import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { PressType } from '../schemas/press.schema';

export class CreatePressDto {
  @IsString()
  title: string;

  @IsEnum(PressType)
  type: PressType;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  publication?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePressDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(PressType)
  @IsOptional()
  type?: PressType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  publication?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
