import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  Response,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { FilesService } from './files.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schemas';

@Controller('files')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Query('category') category?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.filesService.uploadFile(file, req.user.id, category);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
    @Query('category') category?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await Promise.all(
      files.map(file => this.filesService.uploadFile(file, req.user.id, category))
    );

    return { files: results };
  }

  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @Response() res: ExpressResponse,
  ) {
    const file = await this.filesService.getFile(id);
    
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Length': file.buffer.length.toString(),
    });

    res.send(file.buffer);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Response() res: ExpressResponse,
  ) {
    const file = await this.filesService.getFile(id);
    
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.buffer.length.toString(),
    });

    res.send(file.buffer);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteFile(@Param('id') id: string) {
    await this.filesService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }
}