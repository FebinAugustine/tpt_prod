import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Press, PressDocument, PressType } from './schemas/press.schema';
import { CreatePressDto, UpdatePressDto } from './dto/press.dto';

@Injectable()
export class PressService {
  constructor(
    @InjectModel(Press.name) private pressModel: Model<PressDocument>,
  ) {}

  async create(createPressDto: CreatePressDto): Promise<Press> {
    const newPress = new this.pressModel(createPressDto);
    return newPress.save();
  }

  async findAll(
    activeOnly: boolean = false,
    type?: PressType,
  ): Promise<Press[]> {
    const query: any = activeOnly ? { isActive: true } : {};
    if (type) {
      query.type = type;
    }
    return this.pressModel
      .find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Press> {
    const press = await this.pressModel.findById(id).exec();
    if (!press) {
      throw new NotFoundException(`Press with ID ${id} not found`);
    }
    return press;
  }

  async update(id: string, updatePressDto: UpdatePressDto): Promise<Press> {
    const updatedPress = await this.pressModel
      .findByIdAndUpdate(id, updatePressDto, { new: true })
      .exec();
    if (!updatedPress) {
      throw new NotFoundException(`Press with ID ${id} not found`);
    }
    return updatedPress;
  }

  async remove(id: string): Promise<void> {
    const result = await this.pressModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Press with ID ${id} not found`);
    }
  }

  async getCount(
    activeOnly: boolean = false,
    type?: PressType,
  ): Promise<number> {
    const query: any = activeOnly ? { isActive: true } : {};
    if (type) {
      query.type = type;
    }
    return this.pressModel.countDocuments(query).exec();
  }
}
