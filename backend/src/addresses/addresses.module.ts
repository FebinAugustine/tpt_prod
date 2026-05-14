import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import {
  ShippingAddress,
  ShippingAddressSchema,
} from './schemas/address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingAddress.name, schema: ShippingAddressSchema },
    ]),
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
