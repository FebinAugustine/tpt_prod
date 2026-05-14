import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { ConfigurationException } from '../common/exceptions/ConfigurationException';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpHost = configService.get<string>('SMTP_HOST');
    const smtpUser = configService.get<string>('SMTP_USER');
    const smtpPassword = configService.get<string>('SMTP_PASSWORD');

    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new ConfigurationException('SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(configService.get<string>('SMTP_PORT') || '587'),
      secure: configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Reset your Protein App password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a202c; text-align: center;">Reset Your Password</h1>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
            You requested to reset your password for your Protein App account. Click the button below to reset it.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${resetUrl}" 
              style="display: inline-block; padding: 12px 24px; background: #4299e1; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;"
            >
              Reset Password
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">
            If you didn't request this, please ignore this email or contact support if you have concerns.
          </p>
          <p style="color: #718096; font-size: 14px;">
            This reset link will expire in 1 hour.
          </p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
            <p>Protein App</p>
            <p>Your fitness journey starts here</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
