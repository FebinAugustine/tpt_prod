import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCareerDto {
  @IsString()
  title: string;

  @IsString()
  department: string;

  @IsString()
  location: string;

  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateCareerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
