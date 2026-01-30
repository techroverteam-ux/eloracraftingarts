import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  Order,
  OrderSchema,
  Client,
  ClientSchema,
  Measurement,
  MeasurementSchema,
  Installation,
  InstallationSchema,
  FileReference,
  FileReferenceSchema,
} from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Measurement.name, schema: MeasurementSchema },
      { name: Installation.name, schema: InstallationSchema },
      { name: FileReference.name, schema: FileReferenceSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}