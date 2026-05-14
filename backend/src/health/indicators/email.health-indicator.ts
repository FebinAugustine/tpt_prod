import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailHealthIndicator extends HealthIndicator {
  constructor(private configService: ConfigService) {
    super();
  }

  async isHealthy(key: string = 'email'): Promise<HealthIndicatorResult> {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpPort = this.configService.get<string>('SMTP_PORT');
    const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';

    if (!smtpHost || !smtpUser || !smtpPassword) {
      return this.getStatus(key, false, { message: 'SMTP configuration is missing' });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587', 10),
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

      await transporter.verify();
      return this.getStatus(key, true, { message: 'SMTP connection verified' });
    } catch (error: any) {
      return this.getStatus(key, false, { message: 'SMTP connection failed', error: error.message });
    }
  }
}
