import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    private configService: ConfigService,
  ) {
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async getSetting(key: string): Promise<string | null> {
    console.log(`Getting setting for key: ${key}`);
    const setting = await this.settingsModel
      .findOne({ key, isActive: true })
      .exec();
    console.log(`Setting found:`, setting);
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<Settings> {
    const setting = await this.settingsModel.findOneAndUpdate(
      { key },
      { key, value, isActive: true },
      { new: true, upsert: true },
    );
    return setting;
  }

  async getAllSettings(): Promise<Settings[]> {
    return this.settingsModel.find({ isActive: true }).exec();
  }

  async getUpiSettings(): Promise<{
    upiId: string;
    qrCodeUrl: string;
    merchantName: string;
  } | null> {
    const upiId = await this.getSetting('upi_id');
    const qrCodeUrl = await this.getSetting('upi_qr_code');
    const merchantName = await this.getSetting('upi_merchant_name');

    if (!upiId) return null;

    return {
      upiId,
      qrCodeUrl: qrCodeUrl || '',
      merchantName: merchantName || '',
    };
  }

  async setUpiSettings(
    upiId: string,
    merchantName: string,
    qrCodeUrl?: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    // Get current QR code URL for cleanup
    const currentQrCodeUrl = await this.getSetting('upi_qr_code');

    await this.setSetting('upi_id', upiId);
    await this.setSetting('upi_merchant_name', merchantName);

    if (file) {
      try {
        // Delete old QR code from Cloudinary
        if (currentQrCodeUrl) {
          const publicId = this.extractCloudinaryPublicId(currentQrCodeUrl);
          if (publicId) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        }

        const result: UploadApiResponse | UploadApiErrorResponse =
          await cloudinary.v2.uploader.upload(file.path, {
            folder: 'proteinapp/payments',
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 400,
            height: 400,
            crop: 'fit',
          });
        await this.setSetting('upi_qr_code', result.secure_url);
      } catch (error) {
        console.error('Error uploading QR code to Cloudinary:', error);
        throw new InternalServerErrorException('Failed to upload QR code image');
      }
    } else if (qrCodeUrl !== undefined) {
      // Delete old QR code if URL is being cleared
      if (!qrCodeUrl && currentQrCodeUrl) {
        const publicId = this.extractCloudinaryPublicId(currentQrCodeUrl);
        if (publicId) {
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }
      await this.setSetting('upi_qr_code', qrCodeUrl);
    }
  }

  private extractCloudinaryPublicId(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.findIndex((part) => part === 'upload');
      if (uploadIndex === -1) return null;

      const afterUpload = pathParts.slice(uploadIndex + 1);
      const publicIdParts = afterUpload.filter((part) => !part.match(/^v\d+$/));

      if (publicIdParts.length === 0) return null;

      return publicIdParts.join('/');
    } catch (error) {
      console.error('Error extracting Cloudinary public ID:', error);
      return null;
    }
  }

  async uploadQrCodeImage(file: Express.Multer.File): Promise<string> {
    try {
      const result: UploadApiResponse | UploadApiErrorResponse =
        await cloudinary.v2.uploader.upload(file.path, {
          folder: 'proteinapp/payments',
          quality: 'auto:good',
          fetch_format: 'auto',
          width: 400,
          height: 400,
          crop: 'fit',
        });
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading QR code to Cloudinary:', error);
      throw new InternalServerErrorException('Failed to upload QR code image');
    }
  }
}
