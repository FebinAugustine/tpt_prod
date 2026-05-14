import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  Order,
  OrderDocument,
  PaymentStatus,
  OrderStatus,
} from './schemas/order.schema';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/create-order.dto';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { PaginatedResponseDto } from '../common/dto/pagination-response.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class OrdersService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const supportsTransactions = await this.supportsTransactions();

    if (!supportsTransactions) {
      const order = new this.orderModel({
        ...createOrderDto,
        user: userId,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
      });
      const savedOrder = await order.save();
      this.logger.log(`Order created: ${savedOrder._id} (no transaction)`);
      return savedOrder;
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const order = new this.orderModel({
        ...createOrderDto,
        user: userId,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
      });

      const savedOrder = await order.save({ session });

      await session.commitTransaction();

      this.logger.log(`Order created: ${savedOrder._id}`);
      return savedOrder;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Failed to create order: ${error}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async createWithSession(
    createOrderDto: CreateOrderDto,
    userId: string,
    session: ClientSession,
  ): Promise<Order> {
    const order = new this.orderModel({
      ...createOrderDto,
      user: userId,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
    });
    return order.save({ session });
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = '',
  ): Promise<PaginatedResponseDto<Order>> {
    const skip = (page - 1) * limit;

    const query: any = {};
    const searchTrimmed = search?.trim() || '';
    const statusTrimmed = status?.trim() || '';

    if (statusTrimmed) {
      query.orderStatus = statusTrimmed.toLowerCase();
    }

    let orders: Order[];
    let finalQuery = { ...query };

    if (searchTrimmed) {
      const cleanSearch = searchTrimmed.replace(/^#/, '');

      const orConditions: any[] = [];

      if (/^[a-fA-F0-9]{24}$/.test(cleanSearch)) {
        orConditions.push({ _id: cleanSearch });
      }

      if (cleanSearch.length > 0) {
        orConditions.push({
          'upiPaymentDetails.transactionId': {
            $regex: cleanSearch,
            $options: 'i',
          },
        });
      }

      if (orConditions.length > 0) {
        finalQuery = { ...query, $or: orConditions };
      }
    }

    orders = await this.orderModel
      .find(finalQuery)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.orderModel.countDocuments(finalQuery);
    const totalPages = Math.ceil(total / limit);

    return new PaginatedResponseDto(orders, total, page, totalPages, limit, 'orders');
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('user', 'fullName email phone')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(
    id: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const supportsTransactions = await this.supportsTransactions();

    if (!supportsTransactions) {
      const order = await this.orderModel
        .findByIdAndUpdate(
          id,
          { orderStatus: updateDto.orderStatus },
          { returnDocument: 'after' },
        )
        .exec();

      if (!order) {
        throw new NotFoundException(`Order #${id} not found`);
      }

      this.logger.log(
        `Order ${id} status updated to ${updateDto.orderStatus} (no transaction)`,
      );
      return order;
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const order = await this.orderModel
        .findByIdAndUpdate(
          id,
          { orderStatus: updateDto.orderStatus },
          { returnDocument: 'after' },
        )
        .session(session)
        .exec();

      if (!order) {
        await session.abortTransaction();
        throw new NotFoundException(`Order #${id} not found`);
      }

      if (updateDto.orderStatus === OrderStatus.CANCELLED) {
        this.logger.log(`Order ${id} cancelled - inventory should be restored`);
      } else if (updateDto.orderStatus === OrderStatus.CONFIRMED) {
        this.logger.log(`Order ${id} confirmed`);
      }

      await session.commitTransaction();
      this.logger.log(`Order ${id} status updated to ${updateDto.orderStatus}`);
      return order;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Failed to update order status: ${error}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updatePaymentStatus(
    id: string,
    updateDto: UpdatePaymentStatusDto,
  ): Promise<Order> {
    const supportsTransactions = await this.supportsTransactions();

    if (!supportsTransactions) {
      const order = await this.orderModel
        .findByIdAndUpdate(
          id,
          { paymentStatus: updateDto.paymentStatus },
          { returnDocument: 'after' },
        )
        .exec();

      if (!order) {
        throw new NotFoundException(`Order #${id} not found`);
      }

      this.logger.log(
        `Order ${id} payment status: ${updateDto.paymentStatus} (no transaction)`,
      );
      return order;
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const order = await this.orderModel
        .findByIdAndUpdate(
          id,
          { paymentStatus: updateDto.paymentStatus },
          { returnDocument: 'after' },
        )
        .session(session)
        .exec();

      if (!order) {
        await session.abortTransaction();
        throw new NotFoundException(`Order #${id} not found`);
      }

      this.logger.log(`Order ${id} payment status: ${updateDto.paymentStatus}`);

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Failed to update payment status: ${error}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async supportsTransactions(): Promise<boolean> {
    try {
      const admin = this.connection.db?.admin();
      if (!admin) return false;
      const result = await admin.command({ serverStatus: 1 });
      const isReplicaSet =
        result?.repl?.secondaryOkForPeers !== undefined ||
        result?.repl?.isMaster !== undefined ||
        result?.cluster?.type === 'replicaset';
      return isReplicaSet;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<any> {
    const totalOrders = await this.orderModel.countDocuments();
    const pendingOrders = await this.orderModel.countDocuments({
      orderStatus: OrderStatus.PENDING,
    });
    const confirmedOrders = await this.orderModel.countDocuments({
      orderStatus: OrderStatus.CONFIRMED,
    });
    const shippedOrders = await this.orderModel.countDocuments({
      orderStatus: OrderStatus.SHIPPED,
    });
    const deliveredOrders = await this.orderModel.countDocuments({
      orderStatus: OrderStatus.DELIVERED,
    });
    const cancelledOrders = await this.orderModel.countDocuments({
      orderStatus: OrderStatus.CANCELLED,
    });

    const pendingPayments = await this.orderModel.countDocuments({
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: { $ne: OrderStatus.CANCELLED },
    });

    const totalRevenue = await this.orderModel.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['cancelled', 'CANCELLED'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      pendingPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }
}
