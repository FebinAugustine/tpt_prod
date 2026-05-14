import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UIManagerService } from './uimanager.service';
import { AddBannerDto } from './dto/add-banner.dto';
import { AddOfferCardDto } from './dto/add-offer-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CacheInterceptor } from '@nestjs/cache-manager';

const DEFAULT_CACHE_TTL = 300000; // 5 minutes

@Controller({ path: 'uimanager', version: '1' })
@UseInterceptors(CacheInterceptor)
export class UIManagerController {
  constructor(private readonly uiManagerService: UIManagerService) {}

  // ==================== BANNER ENDPOINTS ====================

  @Post('banners')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async addBanner(@Req() req, @UploadedFile() file?: Express.Multer.File) {
    // Parse banner data from FormData
    let bannerData: AddBannerDto;
    if (req.body.banner) {
      try {
        bannerData = JSON.parse(req.body.banner);
      } catch (error) {
        throw new BadRequestException('Invalid banner data');
      }
    } else {
      throw new BadRequestException('Banner data is required');
    }

    return this.uiManagerService.addBanner(bannerData, file);
  }

  @Get('banners')
  @HttpCode(HttpStatus.OK)
  @CacheKey('banners-all')
  @CacheTTL(DEFAULT_CACHE_TTL)
  async getBanners() {
    return this.uiManagerService.getBanners();
  }

  @Get('banners/:id')
  @HttpCode(HttpStatus.OK)
  @CacheKey('banners-id')
  @CacheTTL(DEFAULT_CACHE_TTL)
  async getBannerById(@Param('id') id: string) {
    return this.uiManagerService.getBannerById(id);
  }

  @Put('banners/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      },
    }),
  )
  @HttpCode(HttpStatus.OK)
  async updateBanner(
    @Param('id') id: string,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Parse update data from FormData
    let updateData: Partial<AddBannerDto>;
    if (req.body.banner) {
      try {
        updateData = JSON.parse(req.body.banner);
      } catch (error) {
        throw new BadRequestException('Invalid banner data');
      }
    } else {
      throw new BadRequestException('Banner data is required');
    }

    return this.uiManagerService.updateBanner(id, updateData, file);
  }

  @Delete('banners/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteBanner(@Param('id') id: string) {
    return this.uiManagerService.deleteBanner(id);
  }

  // ==================== OFFER CARD ENDPOINTS ====================

  @Post('offer-cards')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for offer cards (industry standard)
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async addOfferCard(@Req() req, @UploadedFile() file?: Express.Multer.File) {
    // Parse offer card data from FormData
    let offerCardData: AddOfferCardDto;
    if (req.body.offerCard) {
      try {
        offerCardData = JSON.parse(req.body.offerCard);
      } catch (error) {
        throw new BadRequestException('Invalid offer card data');
      }
    } else {
      throw new BadRequestException('Offer card data is required');
    }

    return this.uiManagerService.addOfferCard(offerCardData, file);
  }

  @Get('offer-cards')
  @HttpCode(HttpStatus.OK)
  @CacheKey('offercards-all')
  @CacheTTL(DEFAULT_CACHE_TTL)
  async getOfferCards() {
    return this.uiManagerService.getOfferCards();
  }

  @Get('offer-cards/:id')
  @HttpCode(HttpStatus.OK)
  @CacheKey('offercards-id')
  @CacheTTL(DEFAULT_CACHE_TTL)
  async getOfferCardById(@Param('id') id: string) {
    return this.uiManagerService.getOfferCardById(id);
  }

  @Put('offer-cards/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for offer cards
      },
    }),
  )
  @HttpCode(HttpStatus.OK)
  async updateOfferCard(
    @Param('id') id: string,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Parse update data from FormData
    let updateData: Partial<AddOfferCardDto>;
    if (req.body.offerCard) {
      try {
        updateData = JSON.parse(req.body.offerCard);
      } catch (error) {
        throw new BadRequestException('Invalid offer card data');
      }
    } else {
      throw new BadRequestException('Offer card data is required');
    }

    return this.uiManagerService.updateOfferCard(id, updateData, file);
  }

  @Delete('offer-cards/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteOfferCard(@Param('id') id: string) {
    return this.uiManagerService.deleteOfferCard(id);
  }
}
