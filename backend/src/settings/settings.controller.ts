import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminOnly } from '../auth/decorators/admin.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

@ApiTags('Settings')
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(
    private readonly logger: Logger,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('upi')
  @ApiOperation({
    summary: 'Get UPI settings',
    description: 'Returns UPI payment settings',
  })
  @ApiOkResponse({ description: 'UPI settings retrieved successfully' })
  async getUpiSettings() {
    this.logger.log('GET /settings/upi called');
    const settings = await this.settingsService.getUpiSettings();

    if (!settings) {
      return null;
    }

    this.logger.log(`UPI Settings: upiId=${settings.upiId}`);
    return settings;
  }

  @Put('upi')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Set UPI settings (admin)',
    description: 'Updates UPI payment settings with QR code',
  })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  @ApiOkResponse({ description: 'UPI settings updated' })
  @UseInterceptors(
    FileInterceptor('qrCodeImage', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `qrcode-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async setUpiSettings(
    @Body() body: { upiId: string; merchantName: string; qrCodeUrl?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!body.upiId || !body.merchantName) {
      throw new BadRequestException('UPI ID and merchant name are required');
    }

    await this.settingsService.setUpiSettings(
      body.upiId,
      body.merchantName,
      body.qrCodeUrl,
      file,
    );

    this.logger.log(`UPI settings updated: ${body.upiId}`);
    return { message: 'UPI settings updated successfully' };
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all settings (admin)',
    description: 'Returns all settings',
  })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  @ApiOkResponse({ description: 'Settings retrieved successfully' })
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }
}
