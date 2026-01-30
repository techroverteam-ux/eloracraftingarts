import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ROOKIE = 'rookie',
  INSTALLATION = 'installation',
  CLIENT = 'client',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  phone?: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Order Schema
export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  MEASURED = 'measured',
  IN_PRODUCTION = 'in_production',
  READY_FOR_INSTALLATION = 'ready_for_installation',
  INSTALLED = 'installed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ required: true })
  productType: string;

  @Prop({ type: Object })
  specifications: Record<string, any>;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  notes?: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Client' })
  clientId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Store' })
  storeId: Types.ObjectId;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: [OrderItem] })
  items: OrderItem[];

  @Prop({ type: Types.ObjectId, ref: 'Measurement' })
  measurementId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Installation' })
  installationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedRookie?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedInstaller?: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop()
  dueDate?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Client Schema
export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  contactPerson: string;

  @Prop({ required: true })
  phone: string;
}

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: [Store] })
  stores: Store[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

// Measurement Schema
export type MeasurementDocument = Measurement & Document;

@Schema({ timestamps: true })
export class GeoLocation {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  accuracy?: number;
}

@Schema({ timestamps: true })
export class Measurement {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  rookieId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  measurements: Record<string, number>;

  @Prop({ type: [Types.ObjectId], ref: 'FileReference' })
  images: Types.ObjectId[];

  @Prop()
  notes?: string;

  @Prop({ type: GeoLocation })
  location?: GeoLocation;

  @Prop({ required: true })
  submittedAt: Date;
}

export const MeasurementSchema = SchemaFactory.createForClass(Measurement);

// Installation Schema
export type InstallationDocument = Installation & Document;

@Schema({ timestamps: true })
export class Installation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  installerId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'FileReference' })
  proofImages: Types.ObjectId[];

  @Prop({ type: Object, required: true })
  completionChecklist: Record<string, boolean>;

  @Prop()
  notes?: string;

  @Prop()
  completedAt?: Date;
}

export const InstallationSchema = SchemaFactory.createForClass(Installation);

// File Reference Schema
export type FileReferenceDocument = FileReference & Document;

@Schema({ timestamps: true })
export class FileReference {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop()
  googleDriveId?: string;

  @Prop()
  localPath?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  uploadedAt: Date;
}

export const FileReferenceSchema = SchemaFactory.createForClass(FileReference);