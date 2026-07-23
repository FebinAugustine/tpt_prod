import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  Res,
  Inject,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminOnly } from './decorators/admin.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AddUserDto } from './dto/add-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WrapResponse } from '../common/decorators/wrap-response.decorator';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Logger } from 'nestjs-pino';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly logger: Logger,
    private readonly authService: AuthService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ strict: { limit: 5, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login successful' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    const { accessToken, refreshToken } = result;

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days for access token
      path: '/',
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 27 * 24 * 60 * 60 * 1000, // 27 days for refresh token
      path: '/',
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout', description: 'Logout user and clear cookies. Mobile clients (no cookie jar) should pass refreshToken in the body.' })
  @ApiBearerAuth()
  @ApiBody({ type: RefreshTokenDto, required: false })
  async logout(
    @Request() req: any,
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    // Web: refresh token lives in the httpOnly cookie.
    // Mobile: no cookie jar, so it's passed explicitly in the body.
    const refreshToken = req.cookies?.refreshToken || body?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = await this.authService.verifyRefreshToken(refreshToken);
        const tokenId = decoded.jti;
        if (tokenId) {
          await this.authService.invalidateRefreshToken(userId, tokenId);
        }
      } catch {
        // Token invalid, continue logout
      }
    }

    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return { message: 'Logged out successfully' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration', description: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password', description: 'Send password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password', description: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset successfully' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @Throttle({ strict: { limit: 5, ttl: 60 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Get a new access + refresh token pair using the current refresh token. Web clients rely on the httpOnly cookie; mobile clients (no cookie jar) pass refreshToken in the body and receive the new pair back in the JSON response.',
  })
  @ApiBody({ type: RefreshTokenDto, required: false })
  @ApiOkResponse({ description: 'Token refreshed' })
  async refresh(
    @Request() req: any,
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Web: refresh token lives in the httpOnly cookie.
    // Mobile: no cookie jar, so it's passed explicitly in the body.
    const refreshToken = req.cookies?.refreshToken || body?.refreshToken;

    if (!refreshToken) {
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
      return { success: false, error: 'No refresh token found' };
    }

    try {
      const decoded = await this.authService.verifyRefreshToken(refreshToken);
      const userId = decoded.sub;
      const oldTokenId = decoded.jti;

      const user = await this.authService.getUserById(userId);
      if (!user) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        return { success: false, error: 'Invalid refresh token' };
      }

      if (oldTokenId) {
        await this.authService.invalidateRefreshToken(userId, oldTokenId);
      }

      const payload = { sub: decoded.sub, email: decoded.email, role: decoded.role };
      const newAccessToken = await this.authService.generateAccessToken(payload);
      const newRefreshToken = await this.authService.generateRefreshToken(payload);

      const newDecoded = await this.authService.verifyRefreshToken(newRefreshToken);
      const newTokenId = newDecoded?.jti;

      if (newTokenId) {
        await this.authService.addRefreshToken(userId, newTokenId);
      }

      const isProduction = process.env.NODE_ENV === 'production';
      const accessCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict' as const,
        maxAge: 3 * 24 * 60 * 60 * 1000,
        path: '/',
      };

      const refreshCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict' as const,
        maxAge: 27 * 24 * 60 * 60 * 1000,
        path: '/',
      };

      res.cookie('accessToken', newAccessToken, accessCookieOptions);
      res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

      // Tokens are returned in the body too (not just cookies) so mobile
      // clients — which ignore Set-Cookie — can persist the rotated pair
      // themselves. Web clients simply ignore these extra fields.
      return {
        success: true,
        message: 'Token refreshed',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user profile', description: 'Get current user profile information' })
  @ApiBearerAuth()
  async getProfile(@Request() req: any) {
    const user = await this.authService.getUserById(req.user.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user profile', description: 'Update current user profile information' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Profile updated successfully' })
  @WrapResponse()
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateUserDto) {
    return this.authService.updateUser(req.user.sub, updateProfileDto);
  }

  @Post('add-user')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add user (admin)', description: 'Create a new user (admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: AddUserDto })
  @ApiCreatedResponse({ description: 'User added successfully' })
  async addUser(@Body() addUserDto: AddUserDto) {
    return this.authService.addUser(addUserDto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (admin)', description: 'Get paginated list of users (admin only)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Users retrieved successfully' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : 20;
    return this.authService.getAllUsers(pageNum, limitNum, search || '');
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user (admin)', description: 'Update user details (admin only)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.authService.updateUser(id, updateData);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (admin)', description: 'Delete a user (admin only)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password', description: 'Change user password (authenticated)' })
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ description: 'Password changed successfully' })
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete account', description: 'Delete user account (authenticated)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Account deleted successfully' })
  async deleteAccount(@Request() req: any) {
    return this.authService.deleteUserAccount(req.user.sub);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get dashboard statistics (admin)',
    description: 'Returns aggregated statistics for the admin dashboard',
  })
  @ApiBearerAuth()
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async getDashboardStats(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const [
      totalUsers,
      activeUsers,
      pendingVerifications,
      totalCategories,
      productsInStock,
      productsOutOfStock,
      orderStats,
    ] = await Promise.all([
      this.authService.getTotalUsers(),
      this.authService.getActiveUsers(),
      this.authService.getPendingVerifications(),
      this.categoriesService.getTotalCategories(),
      this.productsService.getProductsInStock(),
      this.productsService.getProductsOutOfStock(),
      this.ordersService.getStats(),
    ]);

    const totalProducts = productsInStock + productsOutOfStock;

    return {
      totalUsers,
      activeUsers,
      pendingVerifications,
      totalRevenue: orderStats.totalRevenue,
      totalCategories,
      totalProducts,
      totalOrders: orderStats.totalOrders,
    };
  }
}
