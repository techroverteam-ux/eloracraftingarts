import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsNumber,
  IsObject,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../database/schemas';

export class OrderItemDto {
  @IsString()
  productType: string;

  @IsObject()
  specifications: Record<string, any>;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsMongoId()
  clientId: string;

  @IsMongoId()
  storeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class AssignOrderDto {
  @IsMongoId()
  userId: string;
}

export class BulkOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders: CreateOrderDto[];
}

export class MeasurementDto {
  @IsMongoId()
  orderId: string;

  @IsObject()
  measurements: Record<string, number>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export class InstallationDto {
  @IsMongoId()
  orderId: string;

  @IsObject()
  completionChecklist: Record<string, boolean>;

  @IsOptional()
  @IsString()
  notes?: string;
}