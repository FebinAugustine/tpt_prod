import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ sortOrder: 1 });
