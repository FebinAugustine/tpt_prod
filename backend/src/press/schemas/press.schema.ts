import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PressDocument = Press & Document;

export enum PressType {
  PRESS_RELEASE = 'press_release',
  MEDIA_COVERAGE = 'media_coverage',
}

@Schema({ timestamps: true })
export class Press {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: PressType })
  type: PressType;

  @Prop({ required: true })
  description: string;

  @Prop()
  date: string;

  @Prop()
  publication: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const PressSchema = SchemaFactory.createForClass(Press);
