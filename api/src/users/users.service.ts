import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole, Client, ClientDocument } from '../database/schemas';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateUserDto.email });
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password -refreshToken')
      .exec();

    return updatedUser;
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot deactivate super admin user');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .select('-password -refreshToken')
      .exec();

    return updatedUser;
  }

  async activate(id: string): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .select('-password -refreshToken')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.userModel
      .find({ role, isActive: true })
      .select('-password -refreshToken')
      .sort({ name: 1 })
      .exec();
  }

  async getRookies(): Promise<User[]> {
    return this.getUsersByRole(UserRole.ROOKIE);
  }

  async getInstallers(): Promise<User[]> {
    return this.getUsersByRole(UserRole.INSTALLATION);
  }

  async getAdmins(): Promise<User[]> {
    return this.userModel
      .find({ 
        role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        isActive: true 
      })
      .select('-password -refreshToken')
      .sort({ name: 1 })
      .exec();
  }

  async createClient(clientData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    stores: Array<{
      name: string;
      address: string;
      contactPerson: string;
      phone: string;
    }>;
  }): Promise<Client> {
    const existingClient = await this.clientModel.findOne({ email: clientData.email });
    if (existingClient) {
      throw new BadRequestException('Client with this email already exists');
    }

    const client = new this.clientModel(clientData);
    return client.save();
  }

  async getClients(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      this.clientModel
        .find({ isActive: true })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.clientModel.countDocuments({ isActive: true }),
    ]);

    return {
      clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getClient(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }
}