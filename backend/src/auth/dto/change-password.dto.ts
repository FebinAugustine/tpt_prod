import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Transform(({ value }) => value?.trim())
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}
