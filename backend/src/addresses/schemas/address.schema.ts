import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShippingAddressDocument = ShippingAddress & Document;

@Schema({ timestamps: true })
export class ShippingAddress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  label: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  fullName: string;

  @Prop({ required: true, trim: true, maxlength: 20 })
  phone: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  address: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  city: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  state: string;

  @Prop({ required: true, trim: true, maxlength: 10 })
  pincode: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const ShippingAddressSchema =
  SchemaFactory.createForClass(ShippingAddress);
