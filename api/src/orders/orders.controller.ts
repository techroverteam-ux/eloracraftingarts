import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { BulkOrderService } from './bulk-order.service';
import { CreateOrderDto, UpdateOrderDto, AssignOrderDto } from './dto/orders.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, OrderStatus } from '../database/schemas';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly bulkOrderService: BulkOrderService,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('bulk-upload')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('Only Excel files are allowed');
    }

    return this.bulkOrderService.processExcelFile(file.buffer);
  }

  @Post('validate-excel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async validateExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.bulkOrderService.validateExcelStructure(file.buffer);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
    @Query('clientId') clientId?: string,
    @Request() req?: any,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // If user is a client, filter by their orders only
    if (req.user.role === UserRole.CLIENT) {
      clientId = req.user.clientId; // Assuming client users have clientId
    }

    return this.ordersService.findAll(pageNum, limitNum, status, clientId);
  }

  @Get('my-orders')
  @Roles(UserRole.ROOKIE, UserRole.INSTALLATION)
  getMyOrders(@Request() req) {
    return this.ordersService.getOrdersByUser(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Additional access control can be added here
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Post(':id/assign-rookie')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  assignRookie(@Param('id') id: string, @Body() assignDto: AssignOrderDto) {
    return this.ordersService.assignRookie(id, assignDto);
  }

  @Post(':id/assign-installer')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  assignInstaller(@Param('id') id: string, @Body() assignDto: AssignOrderDto) {
    return this.ordersService.assignInstaller(id, assignDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }
}