import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  Client,
  ClientDocument,
  User,
  UserDocument,
  UserRole,
} from '../database/schemas';
import { CreateOrderDto, UpdateOrderDto, AssignOrderDto } from './dto/orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate client and store exist
    const client = await this.clientModel.findById(createOrderDto.clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const store = client.stores.find(s => s._id.toString() === createOrderDto.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    const order = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      status: OrderStatus.PENDING,
    });

    return order.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
    clientId?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('clientId', 'name email')
        .populate('assignedRookie', 'name email')
        .populate('assignedInstaller', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel
      .findById(id)
      .populate('clientId')
      .populate('assignedRookie', 'name email')
      .populate('assignedInstaller', 'name email')
      .populate('measurementId')
      .populate('installationId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Validate status transitions
    this.validateStatusTransition(order.status, updateOrderDto.status);

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .populate('clientId')
      .populate('assignedRookie', 'name email')
      .populate('assignedInstaller', 'name email')
      .exec();

    return updatedOrder;
  }

  async assignRookie(id: string, assignDto: AssignOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order must be in pending status to assign rookie');
    }

    // Validate rookie exists and has correct role
    const rookie = await this.userModel.findById(assignDto.userId);
    if (!rookie || rookie.role !== UserRole.ROOKIE) {
      throw new NotFoundException('Rookie not found');
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          assignedRookie: assignDto.userId,
          status: OrderStatus.ASSIGNED,
        },
        { new: true }
      )
      .populate('clientId')
      .populate('assignedRookie', 'name email')
      .exec();

    return updatedOrder;
  }

  async assignInstaller(id: string, assignDto: AssignOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.READY_FOR_INSTALLATION) {
      throw new BadRequestException('Order must be ready for installation to assign installer');
    }

    // Validate installer exists and has correct role
    const installer = await this.userModel.findById(assignDto.userId);
    if (!installer || installer.role !== UserRole.INSTALLATION) {
      throw new NotFoundException('Installer not found');
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        id,
        { assignedInstaller: assignDto.userId },
        { new: true }
      )
      .populate('clientId')
      .populate('assignedInstaller', 'name email')
      .exec();

    return updatedOrder;
  }

  async delete(id: string): Promise<void> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot delete order that is in progress');
    }

    await this.orderModel.findByIdAndDelete(id);
  }

  async getOrdersByUser(userId: string, role: UserRole) {
    const filter: any = {};

    switch (role) {
      case UserRole.ROOKIE:
        filter.assignedRookie = userId;
        break;
      case UserRole.INSTALLATION:
        filter.assignedInstaller = userId;
        break;
      default:
        throw new BadRequestException('Invalid role for user orders');
    }

    return this.orderModel
      .find(filter)
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `ELR${year}${month}${day}`;
    
    // Find the last order number for today
    const lastOrder = await this.orderModel
      .findOne({ orderNumber: { $regex: `^${prefix}` } })
      .sort({ orderNumber: -1 })
      .exec();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus?: OrderStatus): void {
    if (!newStatus) return;

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
      [OrderStatus.ASSIGNED]: [OrderStatus.MEASURED, OrderStatus.CANCELLED],
      [OrderStatus.MEASURED]: [OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED],
      [OrderStatus.IN_PRODUCTION]: [OrderStatus.READY_FOR_INSTALLATION],
      [OrderStatus.READY_FOR_INSTALLATION]: [OrderStatus.INSTALLED],
      [OrderStatus.INSTALLED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}