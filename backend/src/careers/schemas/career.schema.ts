import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CareerDocument = Career & Document;

@Schema({ timestamps: true })
export class Career {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const CareerSchema = SchemaFactory.createForClass(Career);
