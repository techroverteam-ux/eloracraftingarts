import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileReference, FileReferenceDocument } from '../database/schemas';
import { GoogleDriveService } from './google-drive.service';

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
}

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(
    @InjectModel(FileReference.name)
    private fileModel: Model<FileReferenceDocument>,
    private googleDriveService: GoogleDriveService,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.ensureUploadDir();
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadedBy: string,
    category?: string,
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    const filename = `${uuidv4()}-${file.originalname}`;
    const localPath = join(this.uploadDir, filename);

    // Save to local storage first
    await fs.writeFile(localPath, file.buffer);

    // Try to upload to Google Drive
    let googleDriveId: string | null = null;
    const driveResult = await this.googleDriveService.uploadFile(
      file.buffer,
      filename,
      file.mimetype,
      await this.getFolderIdForCategory(category),
    );

    if (driveResult) {
      googleDriveId = driveResult.id;
    }

    // Save file reference to database
    const fileRef = new this.fileModel({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      googleDriveId,
      localPath,
      uploadedBy,
      uploadedAt: new Date(),
    });

    const savedFile = await fileRef.save();

    return {
      id: savedFile._id.toString(),
      filename: savedFile.filename,
      originalName: savedFile.originalName,
      size: savedFile.size,
      mimeType: savedFile.mimeType,
      url: `/api/v1/files/${savedFile._id}`,
    };
  }

  async getFile(id: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }> {
    const fileRef = await this.fileModel.findById(id);
    if (!fileRef) {
      throw new NotFoundException('File not found');
    }

    // Try Google Drive first
    if (fileRef.googleDriveId && this.googleDriveService.isAvailable()) {
      try {
        const stream = await this.googleDriveService.getFileStream(fileRef.googleDriveId);
        if (stream) {
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          return {
            buffer: Buffer.concat(chunks),
            filename: fileRef.originalName,
            mimeType: fileRef.mimeType,
          };
        }
      } catch (error) {
        console.error('Failed to get file from Google Drive, falling back to local', error);
      }
    }

    // Fallback to local storage
    if (fileRef.localPath) {
      try {
        const buffer = await fs.readFile(fileRef.localPath);
        return {
          buffer,
          filename: fileRef.originalName,
          mimeType: fileRef.mimeType,
        };
      } catch (error) {
        throw new NotFoundException('File not found in local storage');
      }
    }

    throw new NotFoundException('File not accessible');
  }

  async deleteFile(id: string): Promise<void> {
    const fileRef = await this.fileModel.findById(id);
    if (!fileRef) {
      throw new NotFoundException('File not found');
    }

    // Delete from Google Drive
    if (fileRef.googleDriveId) {
      await this.googleDriveService.deleteFile(fileRef.googleDriveId);
    }

    // Delete from local storage
    if (fileRef.localPath) {
      try {
        await fs.unlink(fileRef.localPath);
      } catch (error) {
        console.error('Failed to delete local file', error);
      }
    }

    // Delete from database
    await this.fileModel.findByIdAndDelete(id);
  }

  async getFilesByIds(ids: string[]): Promise<FileReference[]> {
    return this.fileModel.find({ _id: { $in: ids } });
  }

  private validateFile(file: Express.Multer.File): void {
    const maxSize = parseInt(this.configService.get('MAX_FILE_SIZE') || '50') * 1024 * 1024;
    const allowedTypes = this.configService.get('ALLOWED_FILE_TYPES')?.split(',') || [];

    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private async getFolderIdForCategory(category?: string): Promise<string | undefined> {
    if (!category) return undefined;

    const folders = await this.googleDriveService.ensureFolderStructure();
    
    switch (category) {
      case 'orders':
        return folders.ordersFolder || undefined;
      case 'measurements':
        return folders.measurementsFolder || undefined;
      case 'installations':
        return folders.installationsFolder || undefined;
      case 'reports':
        return folders.reportsFolder || undefined;
      default:
        return undefined;
    }
  }
}