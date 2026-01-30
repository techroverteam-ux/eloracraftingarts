import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { FilesService } from './files.service';
import { GoogleDriveService } from './google-drive.service';
import { FilesController } from './files.controller';

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [FilesService, GoogleDriveService],
  controllers: [FilesController],
  exports: [FilesService, GoogleDriveService],
})
export class FilesModule {}