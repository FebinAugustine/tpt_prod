import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, maxlength: 200 })
  name: string;

  @Prop({ trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  offerPrice?: number;

  @Prop({ min: 0 })
  trainerPrice?: number;

  @Prop({ trim: true, maxlength: 100 })
  weight?: string;

  @Prop({ trim: true, maxlength: 100 })
  serve?: string;

  @Prop({ default: false })
  isImported: boolean;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ trim: true, maxlength: 100 })
  flavour?: string;

  @Prop({ trim: true, maxlength: 200 })
  company?: string;

  @Prop({ trim: true, maxlength: 200 })
  manufacturer?: string;

  @Prop({ trim: true, maxlength: 1000 })
  howToUse?: string;

  @Prop({ trim: true, maxlength: 1000 })
  whenToUse?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category?: string;

  @Prop({ default: false })
  isTrending: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ default: false })
  isRecommended: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({
  name: 'text',
  description: 'text',
  company: 'text',
  flavour: 'text',
  manufacturer: 'text',
});
ProductSchema.index({ category: 1 });
ProductSchema.index({ inStock: 1, isActive: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ isPopular: 1 });
ProductSchema.index({ isRecommended: 1 });
ProductSchema.index({ sortOrder: 1, createdAt: -1 });
