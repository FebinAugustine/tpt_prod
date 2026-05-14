import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AddUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-Z-' ]+$/, {
    message:
      'Full name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255)
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsEnum(['user', 'admin'], { message: 'Role must be either user or admin' })
  role: string;
}
