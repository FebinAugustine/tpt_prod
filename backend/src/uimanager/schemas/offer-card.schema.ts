import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OfferCardDocument = OfferCard & Document;

@Schema({ timestamps: true })
export class OfferCard {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ trim: true, maxlength: 500 })
  subtitle?: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ trim: true, maxlength: 100 })
  buttonText?: string;

  @Prop({ trim: true, maxlength: 200 })
  buttonLink?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;
}

export const OfferCardSchema = SchemaFactory.createForClass(OfferCard);
