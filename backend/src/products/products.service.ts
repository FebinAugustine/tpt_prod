import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigurationException } from '../common/exceptions/ConfigurationException';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { AddProductDto } from './dto/add-product.dto';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
  ) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ConfigurationException(
        'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required',
      );
    }

    cloudinary.v2.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async addProduct(
    addProductDto: AddProductDto,
    files?: Express.Multer.File[],
  ): Promise<{ message: string; product: Partial<Product> }> {
    const {
      name,
      description,
      price,
      offerPrice,
      trainerPrice,
      weight,
      serve,
      isImported = false,
      inStock = true,
      flavour,
      company,
      manufacturer,
      howToUse,
      whenToUse,
      images = [],
      isActive = true,
      sortOrder = 0,
      category,
      isTrending = false,
      isPopular = false,
      isRecommended = false,
    } = addProductDto;

    // Check if product already exists
    const existingProduct = await this.productModel.findOne({ name });
    if (existingProduct) {
      throw new ConflictException('Product already exists');
    }

    // Upload images to Cloudinary if files are provided
    const uploadedImages: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        try {
          const result: UploadApiResponse | UploadApiErrorResponse =
            await cloudinary.v2.uploader.upload(file.path, {
              folder: 'proteinapp/products',
              quality: 'auto:good', // Auto optimization with good quality
              fetch_format: 'auto', // Auto format detection
              width: 800, // Max width for product images
              crop: 'limit', // Limit crop to maintain aspect ratio
            });
          return result.secure_url;
        } catch (error) {
          console.error('Error uploading image to Cloudinary:', error);
          throw new InternalServerErrorException('Failed to upload image');
        }
      });

      uploadedImages.push(...(await Promise.all(uploadPromises)));
    }

    // Add existing images to uploaded images
    if (images.length > 0) {
      uploadedImages.push(...images);
    }

    // Create new product
    const newProduct = await this.productModel.create({
      name,
      description,
      price,
      offerPrice,
      trainerPrice,
      weight,
      serve,
      isImported,
      inStock,
      flavour,
      company,
      manufacturer,
      howToUse,
      whenToUse,
      images: uploadedImages,
      isActive,
      sortOrder,
      category,
      isTrending,
      isPopular,
      isRecommended,
    });

    // Return product without unnecessary fields
    const { __v, ...productWithoutVersion } = newProduct.toObject();

    return {
      message: 'Product added successfully',
      product: productWithoutVersion,
    };
  }

  async getProducts(): Promise<Product[]> {
    // Find all products and populate category, but only for valid ObjectIds
    const products = await this.productModel
      .find({ category: { $ne: '' } })
      .populate('category')
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec();

    // For products with invalid category, we'll just return them without category populated
    const productsWithInvalidCategory = await this.productModel
      .find({ category: '' })
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec();

    return [...products, ...productsWithInvalidCategory];
  }

  async getProductById(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id).populate('category').exec();
  }

  async updateProduct(
    id: string,
    updateData: Partial<AddProductDto>,
    files?: Express.Multer.File[],
  ): Promise<ProductDocument | null> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get current images and filter out removed ones
    let currentImages = [...product.images];
    const imagesToDelete: string[] = [];

    // Primary reliable path: client explicitly sends the list of existing images to keep.
    // Empty array means "delete all previous images".
    const keptImageUrls = (updateData as any).keptImageUrls;
    if (Array.isArray(keptImageUrls)) {
      currentImages = [...keptImageUrls]; // authoritative from client

      // Calculate what was removed for Cloudinary cleanup
      const keptSet = new Set(keptImageUrls);
      product.images.forEach((url: string) => {
        if (!keptSet.has(url)) {
          imagesToDelete.push(url);
        }
      });
    } 
    // Fallback legacy paths (kept for backward compatibility)
    else {
      const removedImageUrls: string[] = (updateData as any).removedImageUrls || [];
      if (removedImageUrls.length > 0) {
        removedImageUrls.forEach((url: string) => {
          const idx = currentImages.indexOf(url);
          if (idx !== -1) {
            imagesToDelete.push(url);
            currentImages.splice(idx, 1);
          }
        });
      } else {
        const removedImageIndices: number[] = (updateData as any).removedImageIndices || [];
        if (removedImageIndices.length > 0) {
          const sortedIndices = [...removedImageIndices].sort((a: number, b: number) => b - a);
          sortedIndices.forEach((index: number) => {
            if (index >= 0 && index < currentImages.length) {
              imagesToDelete.push(currentImages[index]);
              currentImages.splice(index, 1);
            }
          });
        }
      }
    }

    // Delete removed images from Cloudinary (best effort)
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(async (imageUrl) => {
        try {
          const publicId = this.extractCloudinaryPublicId(imageUrl);
          if (publicId) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        } catch (error) {
          console.error('Error deleting removed image from Cloudinary:', error);
        }
      });
      await Promise.all(deletePromises);
    }

    // Process images
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        try {
          const result: UploadApiResponse | UploadApiErrorResponse =
            await cloudinary.v2.uploader.upload(file.path, {
              folder: 'proteinapp/products',
              quality: 'auto:good',
              fetch_format: 'auto',
              width: 800,
              crop: 'limit',
            });
          return result.secure_url;
        } catch (error) {
          console.error('Error uploading image to Cloudinary:', error);
          throw new InternalServerErrorException('Failed to upload image');
        }
      });

      const newImages = await Promise.all(uploadPromises);

      // Add new images to the filtered current images
      currentImages = [...currentImages, ...newImages];
    }

    // Update the images in the data
    updateData.images = currentImages;

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async updateProductImages(
    id: string,
    files?: Express.Multer.File[],
    keptImageUrls: string[] = [],
  ): Promise<ProductDocument | null> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Start with the images the client wants to keep
    let currentImages = [...keptImageUrls];
    const imagesToDelete: string[] = [];

    // Calculate what was removed for Cloudinary cleanup
    const keptSet = new Set(keptImageUrls);
    product.images.forEach((url: string) => {
      if (!keptSet.has(url)) {
        imagesToDelete.push(url);
      }
    });

    // Delete removed images from Cloudinary (best effort)
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(async (imageUrl) => {
        try {
          const publicId = this.extractCloudinaryPublicId(imageUrl);
          if (publicId) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        } catch (error) {
          console.error('Error deleting removed image from Cloudinary:', error);
        }
      });
      await Promise.all(deletePromises);
    }

    // Upload new images to Cloudinary if files are provided
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        try {
          const result: UploadApiResponse | UploadApiErrorResponse =
            await cloudinary.v2.uploader.upload(file.path, {
              folder: 'proteinapp/products',
              quality: 'auto:good',
              fetch_format: 'auto',
              width: 800,
              crop: 'limit',
            });
          return result.secure_url;
        } catch (error) {
          console.error('Error uploading image to Cloudinary:', error);
          throw new InternalServerErrorException('Failed to upload image');
        }
      });

      const newImages = await Promise.all(uploadPromises);
      currentImages = [...currentImages, ...newImages];
    }

    // Update only the images field
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { $set: { images: currentImages } }, { returnDocument: 'after' })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const product = await this.productModel.findByIdAndDelete(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (imageUrl) => {
        try {
          const publicId = this.extractCloudinaryPublicId(imageUrl);
          if (publicId) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      });
      await Promise.all(deletePromises);
    }

    return { message: 'Product deleted successfully' };
  }

  private extractCloudinaryPublicId(imageUrl: string): string | null {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{filename}
      // or: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.findIndex((part) => part === 'upload');
      if (uploadIndex === -1) return null;

      // Get parts after 'upload'
      const afterUpload = pathParts.slice(uploadIndex + 1);

      // Filter out version (starts with 'v' followed by digits)
      const publicIdParts = afterUpload.filter((part) => !part.match(/^v\d+$/));

      if (publicIdParts.length === 0) return null;

      return publicIdParts.join('/');
    } catch (error) {
      console.error('Error extracting Cloudinary public ID:', error);
      return null;
    }
  }

  async getProductsInStock(): Promise<number> {
    return this.productModel.countDocuments({ inStock: true });
  }

  async getProductsOutOfStock(): Promise<number> {
    return this.productModel.countDocuments({ inStock: false });
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.trim();
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match against name, company, flavour, and manufacturer
    const products = await this.productModel
      .find({
        $or: [
          { name: { $regex: escapedTerm, $options: 'i' } },
          { company: { $regex: escapedTerm, $options: 'i' } },
          { flavour: { $regex: escapedTerm, $options: 'i' } },
          { manufacturer: { $regex: escapedTerm, $options: 'i' } },
        ],
        inStock: true,
      })
      .populate('category')
      .select('name images price offerPrice flavour company weight category')
      .sort({ name: 1 })
      .limit(limit)
      .exec();

    return products;
  }
}
