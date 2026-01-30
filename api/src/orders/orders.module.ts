import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FilesModule } from '../files/files.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { BulkOrderService } from './bulk-order.service';
import { MeasurementService } from './measurement.service';
import { InstallationService } from './installation.service';

@Module({
  imports: [DatabaseModule, FilesModule],
  providers: [
    OrdersService,
    BulkOrderService,
    MeasurementService,
    InstallationService,
  ],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}