import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { AddCategoryDto } from './dto/add-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async addCategory(
    addCategoryDto: AddCategoryDto,
  ): Promise<{ message: string; category: Partial<Category> }> {
    const {
      name,
      description,
      isActive = true,
      sortOrder = 0,
    } = addCategoryDto;

    // Check if category already exists
    const existingCategory = await this.categoryModel.findOne({ name });
    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    // Create new category
    const newCategory = await this.categoryModel.create({
      name,
      description,
      isActive,
      sortOrder,
    });

    // Return category without unnecessary fields
    const { __v, ...categoryWithoutVersion } = newCategory.toObject();

    return {
      message: 'Category added successfully',
      category: categoryWithoutVersion,
    };
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryModel
      .find()
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec();
  }

  async getCategoryById(id: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findById(id).exec();
  }

  async updateCategory(
    id: string,
    updateData: Partial<AddCategoryDto>,
  ): Promise<CategoryDocument | null> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }

  async getTotalCategories(): Promise<number> {
    return this.categoryModel.countDocuments();
  }
}
