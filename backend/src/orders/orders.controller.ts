import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminOnly } from '../auth/decorators/admin.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly logger: Logger,
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create new order',
    description: 'Creates a new order',
  })
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto, req.user.sub);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get orders',
    description: 'Returns orders for user or all orders for admin',
  })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page (1-100)',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search by order ID or name',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by status',
    required: false,
  })
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    if (req.user.role === 'admin') {
      const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
      const limitNum = limit
        ? Math.min(Math.max(1, parseInt(limit, 10)), 100)
        : 10;
      return this.ordersService.findAllPaginated(
        pageNum,
        limitNum,
        search || '',
        status || '',
      );
    }
    const orders = await this.ordersService.findAllByUser(req.user.sub);
    return {
      orders,
      total: orders.length,
      page: 1,
      totalPages: 1,
    };
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get order stats (admin)',
    description: 'Returns aggregated order statistics',
  })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Returns a single order by ID',
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderUser = order.user as any;
    const userId =
      typeof orderUser === 'object' && orderUser !== null
        ? orderUser._id?.toString() || orderUser.id
        : String(orderUser);

    if (req.user.role !== 'admin' && userId !== req.user.sub) {
      throw new ForbiddenException('You are not authorized to view this order');
    }
    return order;
  }

  @Put(':id/status')
  @UseGuards(AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update order status (admin)',
    description: 'Updates order status',
  })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateDto);
  }

  @Put(':id/payment')
  @UseGuards(AdminGuard)
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update payment status (admin)',
    description: 'Updates payment status',
  })
  @ApiForbiddenResponse({ description: 'Not an admin' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentStatusDto,
  ) {
    return this.ordersService.updatePaymentStatus(id, updateDto);
  }
}
