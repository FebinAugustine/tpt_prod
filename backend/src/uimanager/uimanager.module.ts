import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UIManagerController } from './uimanager.controller';
import { UIManagerService } from './uimanager.service';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { OfferCard, OfferCardSchema } from './schemas/offer-card.schema';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
      { name: OfferCard.name, schema: OfferCardSchema },
    ]),
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [UIManagerController],
  providers: [UIManagerService],
  exports: [UIManagerService],
})
export class UIManagerModule {}
