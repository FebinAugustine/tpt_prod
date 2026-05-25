import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AddProductDto } from './dto/add-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminOnly } from '../auth/decorators/admin.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';

const DEFAULT_CACHE_TTL = 300000; // 5 minutes

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add new product',
    description: 'Creates a new product with images (admin only)',
  })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  @UseInterceptors(
    FilesInterceptor('images', 8, {
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
  async addProduct(@Req() req, @UploadedFiles() files?: Express.Multer.File[]) {
    let productData: AddProductDto;
    if (req.body.product) {
      try {
        productData = JSON.parse(req.body.product);
      } catch (error) {
        throw new BadRequestException('Invalid product data');
      }
    } else {
      throw new BadRequestException('Product data is required');
    }

    return this.productsService.addProduct(productData, files);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search products',
    description: 'Search products by name, company, flavour or manufacturer',
  })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum results (1-50)',
    required: false,
  })
  async searchProducts(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit
      ? Math.min(Math.max(1, parseInt(limit, 10)), 50)
      : 10;
    return this.productsService.searchProducts(query, limitNum);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @CacheKey('products-all')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @ApiOperation({
    summary: 'Get all products',
    description: 'Returns all products (cached for 5 minutes)',
  })
  async getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @CacheKey('products-id')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Returns a single product by ID (cached for 5 minutes)',
  })
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Patch(':id/images')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product images only',
    description: 'Updates only the images of a product without modifying other fields (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Product images updated' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  @UseInterceptors(
    FilesInterceptor('images', 8, {
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
  async updateProductImages(
    @Param('id') id: string,
    @Req() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const keptImageUrls = req.body.keptImageUrls
      ? JSON.parse(req.body.keptImageUrls)
      : [];
    return this.productsService.updateProductImages(id, files, keptImageUrls);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product',
    description: 'Updates a product (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  @UseInterceptors(
    FilesInterceptor('images', 8, {
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
  async updateProduct(
    @Param('id') id: string,
    @Req() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log('[updateProduct] req.body keys:', Object.keys(req.body));
    console.log('[updateProduct] keptImageUrls raw:', req.body.keptImageUrls);
    
    // Parse update data from FormData
    let updateData: Partial<AddProductDto>;
    if (req.body.product) {
      try {
        updateData = JSON.parse(req.body.product);
      } catch (error) {
        throw new BadRequestException('Invalid product data');
      }
    } else {
      throw new BadRequestException('Product data is required');
    }

    // Preferred: explicit list of images the client wants to keep (most reliable)
    if (req.body.keptImageUrls) {
      try {
        (updateData as any).keptImageUrls = JSON.parse(req.body.keptImageUrls);
        console.log('[updateProduct] Parsed keptImageUrls:', (updateData as any).keptImageUrls);
      } catch (error) {
        console.error('[updateProduct] Failed to parse keptImageUrls:', error);
      }
    } else {
      console.log('[updateProduct] keptImageUrls not found in request');
    }
    
    // Legacy support
    if (req.body.removedImageUrls) {
      try {
        (updateData as any).removedImageUrls = JSON.parse(req.body.removedImageUrls);
      } catch (error) {
        // ignore
      }
    } else if (req.body.removedImageIndices) {
      try {
        (updateData as any).removedImageIndices = JSON.parse(req.body.removedImageIndices);
      } catch (error) {
        // ignore
      }
    }

    return this.productsService.updateProduct(id, updateData, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product',
    description: 'Deletes a product (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
