import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  label: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  city: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  state: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @Transform(({ value }) => value?.trim())
  pincode: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  @Transform(({ value }) => value?.trim())
  pincode?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDefault?: boolean;
}
