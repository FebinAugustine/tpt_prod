import {
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsArray,
  Min,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  address: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  city: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  state: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  pincode: string;
}

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  product: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Offer price must be a valid number' })
  @Min(0)
  @Type(() => Number)
  offerPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpiPaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  referenceNo: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  screenshotUrl?: string;
}

export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsArray()
  @IsNotEmpty({ message: 'Items array cannot be empty' })
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsNumber({}, { message: 'Subtotal must be a valid number' })
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  subtotal: number;

  @IsOptional()
  @IsNumber({}, { message: 'Shipping cost must be a valid number' })
  @Min(0)
  @Type(() => Number)
  shippingCost?: number;

  @IsNumber({}, { message: 'Total must be a valid number' })
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  total: number;

  @IsEnum(['upi', 'razorpay'], {
    message: 'Payment method must be upi or razorpay',
  })
  paymentMethod: 'upi' | 'razorpay';

  @ValidateNested()
  @Type(() => UpiPaymentDetailsDto)
  @IsOptional()
  upiPaymentDetails?: UpiPaymentDetailsDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    message: 'Invalid order status',
  })
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export class UpdatePaymentStatusDto {
  @IsEnum(['pending', 'verified', 'failed'], {
    message: 'Invalid payment status',
  })
  paymentStatus: 'pending' | 'verified' | 'failed';
}
