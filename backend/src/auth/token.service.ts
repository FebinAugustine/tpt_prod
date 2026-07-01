import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { InvalidTokenException } from '../common/exceptions/InvalidTokenException';
import { ConfigurationException } from '../common/exceptions/ConfigurationException';

const REQUIRED_ENV_ERROR =
  'Environment variable is required. Add it to your .env file.';

@Injectable()
export class TokenService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new ConfigurationException(`JWT_SECRET ${REQUIRED_ENV_ERROR}`);
    }
    this.jwtSecret = jwtSecret;

    const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!jwtRefreshSecret) {
      throw new ConfigurationException(`JWT_REFRESH_SECRET ${REQUIRED_ENV_ERROR}`);
    }
    this.jwtRefreshSecret = jwtRefreshSecret;
  }

  private generateTokenId(): string {
    return randomBytes(32).toString('hex');
  }

  async generateAccessToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '3d',
    });
  }

  async generateRefreshToken(payload: any): Promise<string> {
    const tokenId = this.generateTokenId();
    return this.jwtService.sign(
      { ...payload, jti: tokenId },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: '27d',
      },
    );
  }

    async verifyRefreshToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: this.jwtRefreshSecret,
      });
    } catch (error) {
      throw new InvalidTokenException('Invalid or expired refresh token');
    }
  }

  async verifyAccessToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: this.jwtSecret,
      });
    } catch (error) {
      throw new InvalidTokenException('Invalid or expired access token');
    }
  }
}
