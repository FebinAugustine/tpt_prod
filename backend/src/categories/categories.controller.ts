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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AddCategoryDto } from './dto/add-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminOnly } from '../auth/decorators/admin.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CacheInterceptor } from '@nestjs/cache-manager';

const DEFAULT_CACHE_TTL = 300000; // 5 minutes

@ApiTags('Categories')
@Controller({ path: 'categories', version: '1' })
@UseInterceptors(CacheInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add new category',
    description: 'Creates a new category (admin only)',
  })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async addCategory(@Body() addCategoryDto: AddCategoryDto, @Req() req) {
    // Check if user is authenticated and has admin role (we can add more validation if needed)
    return this.categoriesService.addCategory(addCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @CacheKey('categories-all')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns all categories (cached for 5 minutes)',
  })
  async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @CacheKey('categories-id')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Returns a single category by ID (cached for 5 minutes)',
  })
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates a category (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateData: Partial<AddCategoryDto>,
  ) {
    return this.categoriesService.updateCategory(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Deletes a category (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
