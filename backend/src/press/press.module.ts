import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PressController } from './press.controller';
import { PressService } from './press.service';
import { Press, PressSchema } from './schemas/press.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Press.name, schema: PressSchema }]),
  ],
  controllers: [PressController],
  providers: [PressService],
  exports: [PressService],
})
export class PressModule {}
