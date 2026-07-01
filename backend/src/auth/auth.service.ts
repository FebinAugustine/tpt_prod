import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EmailService } from './email.service';
import { TokenService } from './token.service';
import { PaginatedResponseDto } from '../common/dto/pagination-response.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
    private emailService: EmailService,
    private tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { fullName, email, password, phone } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(`Registration failed - email already exists: ${email}`);
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await this.userModel.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      refreshTokens: [],
    });

    this.logger.log(`User registered successfully: ${email}`);
    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto): Promise<{
    message: string;
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(`Login failed - user not found: ${email}`);
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed - invalid password: ${email}`);
      throw new BadRequestException('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user.toObject();

    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    const decodedRefresh = await this.tokenService
      .verifyRefreshToken(refreshToken)
      .catch(() => null);
    const tokenId = decodedRefresh?.jti;

    if (tokenId) {
      await this.userModel.findByIdAndUpdate(user._id, {
        $push: { refreshTokens: tokenId },
      });
    }

    this.logger.log(`User logged in successfully: ${email}`);
    return {
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async invalidateRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: tokenId },
    });
  }

  async addRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { refreshTokens: tokenId },
    });
  }

  async isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) return false;
    return user.refreshTokens?.includes(tokenId) ?? false;
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 12);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset link sent to your email' };
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return this.tokenService.verifyRefreshToken(token);
  }

  async generateAccessToken(payload: any): Promise<string> {
    return this.tokenService.generateAccessToken(payload);
  }

  async generateRefreshToken(payload: any): Promise<string> {
    return this.tokenService.generateRefreshToken(payload);
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Find all users with valid reset token expiration
    const users = await this.userModel.find({
      resetPasswordExpires: { $gt: new Date() },
      resetPasswordToken: { $exists: true },
    });

    // Find user with matching token
    let user: UserDocument | null = null;
    for (const u of users) {
      const isTokenValid = await bcrypt.compare(token, u.resetPasswordToken!);
      if (isTokenValid) {
        user = u as UserDocument;
        break;
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Find user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      this.logger.warn(`Invalid current password for user: ${user.email}`);
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as current
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new BadRequestException(
        'New password cannot be same as current password',
      );
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Invalidate all refresh tokens for security
    user.refreshTokens = [];

    await user.save();

    this.logger.log(`Password changed successfully for user: ${user.email}`);
    return { message: 'Password changed successfully' };
  }

  async deleteUserAccount(userId: string): Promise<{ message: string }> {
    // Find user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Deleting user account: ${user.email}`);

    // Get MongoDB collections directly via connection
    const db = this.connection.db;
    if (!db) {
      throw new InternalServerErrorException('Database connection is not established');
    }

    // Delete all addresses for this user
    await db.collection('shippingaddresses').deleteMany({ user: userId });

    // Delete all orders for this user
    await db.collection('orders').deleteMany({ user: userId });

    // Delete user
    await this.userModel.findByIdAndDelete(userId);

    this.logger.log(
      `User account and all related data deleted successfully: ${user.email}`,
    );
    return { message: 'Account deleted successfully' };
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<PaginatedResponseDto<User>> {
    const skip = (page - 1) * limit;

    let query: any = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [{ fullName: searchRegex }, { email: searchRegex }],
      };
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query, {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(query),
    ]);

    return new PaginatedResponseDto(
      users,
      total,
      page,
      Math.ceil(total / limit),
      limit,
      'users', // alias for backward compatibility
    );
  }

  async addUser(
    addUserDto: any,
  ): Promise<{ message: string; user: Partial<User> }> {
    const { fullName, email, password, role = 'user', phone } = addUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await this.userModel.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Auto verify users added by admin
      phone,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return {
      message: 'User added successfully',
      user: userWithoutPassword,
    };
  }

  async getTotalUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async getActiveUsers(): Promise<number> {
    return this.userModel.countDocuments({ isVerified: true });
  }

  async getPendingVerifications(): Promise<number> {
    return this.userModel.countDocuments({ isVerified: false });
  }

  async updateUser(
    id: string,
    updateData: any,
  ): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user
    if (updateData.fullName !== undefined) {
      user.fullName = updateData.fullName;
    }
    if (updateData.email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await this.userModel.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
      user.email = updateData.email;
    }
    if (updateData.role !== undefined) {
      user.role = updateData.role;
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }
    if (updateData.password !== undefined) {
      user.password = await bcrypt.hash(updateData.password, 12);
    }
    if (updateData.isVerified !== undefined) {
      user.isVerified = updateData.isVerified;
    }

    await user.save();

    // Fetch the fresh user document to ensure all fields are populated
    const freshUser = await this.userModel.findById(id).lean();
    if (!freshUser) {
      throw new NotFoundException('User not found');
    }
    
    // Return user without sensitive fields
    const { password, resetPasswordToken, resetPasswordExpires, __v, ...userWithoutPassword } = freshUser;
    
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}
