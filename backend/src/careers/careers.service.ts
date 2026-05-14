import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Career, CareerDocument } from './schemas/career.schema';
import { CreateCareerDto, UpdateCareerDto } from './dto/career.dto';

@Injectable()
export class CareersService {
  constructor(
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
  ) {}

  async create(createCareerDto: CreateCareerDto): Promise<Career> {
    const newCareer = new this.careerModel(createCareerDto);
    return newCareer.save();
  }

  async findAll(activeOnly: boolean = false): Promise<Career[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.careerModel
      .find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Career> {
    const career = await this.careerModel.findById(id).exec();
    if (!career) {
      throw new NotFoundException(`Career with ID ${id} not found`);
    }
    return career;
  }

  async update(id: string, updateCareerDto: UpdateCareerDto): Promise<Career> {
    const updatedCareer = await this.careerModel
      .findByIdAndUpdate(id, updateCareerDto, { new: true })
      .exec();
    if (!updatedCareer) {
      throw new NotFoundException(`Career with ID ${id} not found`);
    }
    return updatedCareer;
  }

  async remove(id: string): Promise<void> {
    const result = await this.careerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Career with ID ${id} not found`);
    }
  }

  async getCount(activeOnly: boolean = false): Promise<number> {
    const query = activeOnly ? { isActive: true } : {};
    return this.careerModel.countDocuments(query).exec();
  }
}
