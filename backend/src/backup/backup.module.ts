import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}