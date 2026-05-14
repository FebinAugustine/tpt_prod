import { IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
