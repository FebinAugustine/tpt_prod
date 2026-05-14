import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ShippingAddress,
  ShippingAddressDocument,
} from './schemas/address.schema';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(ShippingAddress.name)
    private addressModel: Model<ShippingAddressDocument>,
  ) {}

  async create(
    createAddressDto: CreateAddressDto,
    userId: string,
  ): Promise<ShippingAddress> {
    const existingAddresses = await this.addressModel.countDocuments({
      user: userId,
    });

    if (existingAddresses >= 3) {
      throw new BadRequestException('Maximum 3 addresses allowed');
    }

    if (createAddressDto.isDefault) {
      await this.addressModel.updateMany(
        { user: userId },
        { isDefault: false },
      );
    }

    const address = new this.addressModel({
      ...createAddressDto,
      user: userId,
    });
    return address.save();
  }

  async findAllByUser(userId: string): Promise<ShippingAddress[]> {
    return this.addressModel
      .find({ user: userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<ShippingAddress> {
    const address = await this.addressModel.findOne({ _id: id, user: userId });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
    userId: string,
  ): Promise<ShippingAddress> {
    const address = await this.addressModel.findOne({ _id: id, user: userId });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (updateAddressDto.isDefault) {
      await this.addressModel.updateMany(
        { user: userId, _id: { $ne: id } },
        { isDefault: false },
      );
    }

    Object.assign(address, updateAddressDto);
    return address.save();
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.addressModel.deleteOne({ _id: id, user: userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Address not found');
    }
  }

  async setDefault(id: string, userId: string): Promise<ShippingAddress> {
    await this.addressModel.updateMany({ user: userId }, { isDefault: false });

    const address = await this.addressModel.findOneAndUpdate(
      { _id: id, user: userId },
      { isDefault: true },
      { new: true },
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }
}
