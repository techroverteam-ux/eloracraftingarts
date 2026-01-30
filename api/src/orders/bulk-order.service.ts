import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { Order, OrderDocument, Client, ClientDocument } from '../database/schemas';
import { OrdersService } from './orders.service';

export interface BulkOrderResult {
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    errors: string[];
  }>;
  orders: Order[];
}

export interface ExcelOrderRow {
  clientName: string;
  clientEmail: string;
  storeName: string;
  productType: string;
  specifications: string; // JSON string
  quantity: number;
  notes?: string;
  dueDate?: string;
}

@Injectable()
export class BulkOrderService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private ordersService: OrdersService,
  ) {}

  async processExcelFile(buffer: Buffer): Promise<BulkOrderResult> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data: ExcelOrderRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      throw new BadRequestException('Excel file is empty');
    }

    // Validate headers
    this.validateExcelHeaders(data[0]);

    const result: BulkOrderResult = {
      successful: 0,
      failed: 0,
      errors: [],
      orders: [],
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const order = await this.processOrderRow(row, i + 2); // +2 for header and 0-based index
        result.orders.push(order);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          errors: Array.isArray(error.message) ? error.message : [error.message],
        });
      }
    }

    return result;
  }

  private validateExcelHeaders(firstRow: any): void {
    const requiredHeaders = [
      'clientName',
      'clientEmail',
      'storeName',
      'productType',
      'specifications',
      'quantity',
    ];

    const missingHeaders = requiredHeaders.filter(header => !(header in firstRow));
    
    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Missing required columns: ${missingHeaders.join(', ')}`
      );
    }
  }

  private async processOrderRow(row: ExcelOrderRow, rowNumber: number): Promise<Order> {
    const errors: string[] = [];

    // Validate required fields
    if (!row.clientName?.trim()) errors.push('Client name is required');
    if (!row.clientEmail?.trim()) errors.push('Client email is required');
    if (!row.storeName?.trim()) errors.push('Store name is required');
    if (!row.productType?.trim()) errors.push('Product type is required');
    if (!row.quantity || row.quantity <= 0) errors.push('Quantity must be greater than 0');

    if (errors.length > 0) {
      throw new Error(errors);
    }

    // Find or create client
    let client = await this.clientModel.findOne({ email: row.clientEmail.trim() });
    
    if (!client) {
      // Create new client
      client = new this.clientModel({
        name: row.clientName.trim(),
        email: row.clientEmail.trim(),
        phone: '', // Will need to be updated later
        address: '', // Will need to be updated later
        stores: [{
          name: row.storeName.trim(),
          address: '', // Will need to be updated later
          contactPerson: row.clientName.trim(),
          phone: '', // Will need to be updated later
        }],
      });
      await client.save();
    } else {
      // Check if store exists, if not add it
      const existingStore = client.stores.find(s => s.name === row.storeName.trim());
      if (!existingStore) {
        client.stores.push({
          name: row.storeName.trim(),
          address: '',
          contactPerson: row.clientName.trim(),
          phone: '',
        } as any);
        await client.save();
      }
    }

    // Find the store
    const store = client.stores.find(s => s.name === row.storeName.trim());
    if (!store) {
      throw new Error('Store not found after creation');
    }

    // Parse specifications
    let specifications: Record<string, any> = {};
    if (row.specifications?.trim()) {
      try {
        specifications = JSON.parse(row.specifications.trim());
      } catch (error) {
        specifications = { description: row.specifications.trim() };
      }
    }

    // Create order
    const orderData = {
      clientId: client._id.toString(),
      storeId: store._id.toString(),
      items: [{
        productType: row.productType.trim(),
        specifications,
        quantity: row.quantity,
        notes: row.notes?.trim(),
      }],
      notes: row.notes?.trim(),
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString() : undefined,
    };

    return this.ordersService.create(orderData);
  }

  async validateExcelStructure(buffer: Buffer): Promise<{
    isValid: boolean;
    errors: string[];
    preview: any[];
  }> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      if (data.length === 0) {
        return {
          isValid: false,
          errors: ['Excel file is empty'],
          preview: [],
        };
      }

      const errors: string[] = [];
      
      try {
        this.validateExcelHeaders(data[0]);
      } catch (error) {
        errors.push(error.message);
      }

      // Return preview of first 5 rows
      const preview = data.slice(0, 5);

      return {
        isValid: errors.length === 0,
        errors,
        preview,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid Excel file format'],
        preview: [],
      };
    }
  }
}