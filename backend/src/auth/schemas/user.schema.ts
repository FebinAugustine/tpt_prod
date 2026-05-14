import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, maxlength: 100 })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop({ trim: true, maxlength: 20 })
  phone: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ type: [String], default: [] })
  refreshTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
