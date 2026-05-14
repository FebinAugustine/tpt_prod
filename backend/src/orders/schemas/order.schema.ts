import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum PaymentMethod {
  UPI = 'upi',
  RAZORPAY = 'razorpay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  offerPrice?: number;

  @Prop({ type: [String] })
  images: string[];
}

@Schema()
export class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  pincode: string;
}

@Schema()
export class UpiPaymentDetails {
  @Prop()
  transactionId: string;

  @Prop()
  referenceNo: string;

  @Prop({ type: Date })
  paidAt: Date;

  @Prop()
  screenshotUrl?: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  shippingCost: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  orderStatus: OrderStatus;

  @Prop({ type: Object })
  upiPaymentDetails?: UpiPaymentDetails;

  @Prop()
  razorpayPaymentId?: string;

  @Prop()
  razorpayOrderId?: string;

  @Prop()
  razorpaySignature?: string;

  @Prop()
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ total: 1 });
