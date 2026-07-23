import { IsOptional, IsString } from 'class-validator';

/**
 * Body for /auth/refresh and /auth/logout.
 *
 * Web clients don't need this — the refresh token travels in the httpOnly
 * cookie automatically. Mobile clients (which have no cookie jar) pass the
 * refresh token here instead. Both transports feed the exact same rotation
 * logic in AuthService/TokenService.
 */
export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
