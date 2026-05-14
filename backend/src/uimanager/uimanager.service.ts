import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { OfferCard, OfferCardDocument } from './schemas/offer-card.schema';
import { AddBannerDto } from './dto/add-banner.dto';
import { AddOfferCardDto } from './dto/add-offer-card.dto';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class UIManagerService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(OfferCard.name)
    private offerCardModel: Model<OfferCardDocument>,
    private configService: ConfigService,
  ) {
    // Configure Cloudinary
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // ==================== BANNER METHODS ====================

  async addBanner(
    addBannerDto: AddBannerDto,
    file?: Express.Multer.File,
  ): Promise<{ message: string; banner: Partial<Banner> }> {
    const {
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      isActive = true,
      sortOrder = 0,
    } = addBannerDto;

    // Check if banner with same title already exists
    const existingBanner = await this.bannerModel.findOne({ title });
    if (existingBanner) {
      throw new ConflictException('Banner with this title already exists');
    }

    // Upload image to Cloudinary if file is provided
    let uploadedImage: string | undefined = image;
    if (file) {
      try {
        const result: UploadApiResponse | UploadApiErrorResponse =
          await cloudinary.v2.uploader.upload(file.path, {
            folder: 'proteinapp/banners',
            quality: 'auto:good', // Auto optimization with good quality
            fetch_format: 'auto', // Auto format detection
            width: 1200, // Max width for banner images
            crop: 'limit', // Limit crop to maintain aspect ratio
          });
        uploadedImage = result.secure_url;
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new InternalServerErrorException('Failed to upload image');
      }
    }

    // Create new banner
    const newBanner = await this.bannerModel.create({
      title,
      subtitle,
      image: uploadedImage,
      buttonText,
      buttonLink,
      isActive,
      sortOrder,
    });

    // Return banner without unnecessary fields
    const { __v, ...bannerWithoutVersion } = newBanner.toObject();

    return {
      message: 'Banner added successfully',
      banner: bannerWithoutVersion,
    };
  }

  async getBanners(): Promise<Banner[]> {
    return this.bannerModel.find().sort({ sortOrder: 1, createdAt: 1 }).exec();
  }

  async getBannerById(id: string): Promise<BannerDocument | null> {
    return this.bannerModel.findById(id).exec();
  }

  async updateBanner(
    id: string,
    updateData: Partial<AddBannerDto>,
    file?: Express.Multer.File,
  ): Promise<BannerDocument | null> {
    const banner = await this.bannerModel.findById(id).exec();
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    // Handle image upload if new file is provided
    if (file) {
      try {
        const result: UploadApiResponse | UploadApiErrorResponse =
          await cloudinary.v2.uploader.upload(file.path, {
            folder: 'proteinapp/banners',
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 1200,
            crop: 'limit',
          });
        updateData.image = result.secure_url;
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new InternalServerErrorException('Failed to upload image');
      }
    }

    const updatedBanner = await this.bannerModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    if (!updatedBanner) {
      throw new NotFoundException('Banner not found');
    }

    return updatedBanner;
  }

  async deleteBanner(id: string): Promise<{ message: string }> {
    const banner = await this.bannerModel.findByIdAndDelete(id).exec();

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    // Delete image from Cloudinary (optional - for permanent deletion)
    if (banner.image) {
      // This would require extracting public ID from Cloudinary URL
    }

    return { message: 'Banner deleted successfully' };
  }

  // ==================== OFFER CARD METHODS ====================

  async addOfferCard(
    addOfferCardDto: AddOfferCardDto,
    file?: Express.Multer.File,
  ): Promise<{ message: string; offerCard: Partial<OfferCard> }> {
    const {
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      isActive = true,
      sortOrder = 0,
    } = addOfferCardDto;

    // Check if offer card with same title already exists
    const existingOfferCard = await this.offerCardModel.findOne({ title });
    if (existingOfferCard) {
      throw new ConflictException('Offer card with this title already exists');
    }

    // Upload image to Cloudinary with offer card specific dimensions (250*100)
    let uploadedImage: string | undefined = image;
    if (file) {
      try {
        const result: UploadApiResponse | UploadApiErrorResponse =
          await cloudinary.v2.uploader.upload(file.path, {
            folder: 'proteinapp/offer-cards',
            quality: 'auto:good', // Auto optimization with good quality
            fetch_format: 'auto', // Auto format detection
            width: 250, // Fixed width for offer cards
            height: 100, // Fixed height for offer cards
            crop: 'fill', // Fill to exact dimensions (will auto-crop)
            gravity: 'center', // Center the crop
          });
        uploadedImage = result.secure_url;
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new InternalServerErrorException('Failed to upload image');
      }
    }

    // Create new offer card
    const newOfferCard = await this.offerCardModel.create({
      title,
      subtitle,
      image: uploadedImage,
      buttonText,
      buttonLink,
      isActive,
      sortOrder,
    });

    // Return offer card without unnecessary fields
    const { __v, ...offerCardWithoutVersion } = newOfferCard.toObject();

    return {
      message: 'Offer card added successfully',
      offerCard: offerCardWithoutVersion,
    };
  }

  async getOfferCards(): Promise<OfferCard[]> {
    return this.offerCardModel
      .find()
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec();
  }

  async getOfferCardById(id: string): Promise<OfferCardDocument | null> {
    return this.offerCardModel.findById(id).exec();
  }

  async updateOfferCard(
    id: string,
    updateData: Partial<AddOfferCardDto>,
    file?: Express.Multer.File,
  ): Promise<OfferCardDocument | null> {
    const offerCard = await this.offerCardModel.findById(id).exec();
    if (!offerCard) {
      throw new NotFoundException('Offer card not found');
    }

    // Handle image upload if new file is provided with offer card dimensions
    if (file) {
      try {
        const result: UploadApiResponse | UploadApiErrorResponse =
          await cloudinary.v2.uploader.upload(file.path, {
            folder: 'proteinapp/offer-cards',
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 250,
            height: 100,
            crop: 'fill',
            gravity: 'center',
          });
        updateData.image = result.secure_url;
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new InternalServerErrorException('Failed to upload image');
      }
    }

    const updatedOfferCard = await this.offerCardModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    if (!updatedOfferCard) {
      throw new NotFoundException('Offer card not found');
    }

    return updatedOfferCard;
  }

  async deleteOfferCard(id: string): Promise<{ message: string }> {
    const offerCard = await this.offerCardModel.findByIdAndDelete(id).exec();

    if (!offerCard) {
      throw new NotFoundException('Offer card not found');
    }

    return { message: 'Offer card deleted successfully' };
  }
}
