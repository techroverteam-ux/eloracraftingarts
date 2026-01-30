import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: any;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeGoogleDrive();
  }

  private async initializeGoogleDrive() {
    try {
      const clientId = this.configService.get('GOOGLE_DRIVE_CLIENT_ID');
      const clientSecret = this.configService.get('GOOGLE_DRIVE_CLIENT_SECRET');
      const redirectUri = this.configService.get('GOOGLE_DRIVE_REDIRECT_URI');

      if (!clientId || !clientSecret) {
        this.logger.warn('Google Drive credentials not configured, using local storage only');
        return;
      }

      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      
      // In production, you would store and retrieve refresh tokens properly
      // For now, we'll assume service account or other auth method
      this.drive = google.drive({ version: 'v3', auth });
      this.isConfigured = true;
      
      this.logger.log('Google Drive service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive service', error);
    }
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folderId?: string,
  ): Promise<{ id: string; webViewLink: string } | null> {
    if (!this.isConfigured) {
      this.logger.warn('Google Drive not configured, skipping upload');
      return null;
    }

    try {
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const response = await this.drive.files.create({
        requestBody: {
          name: filename,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType,
          body: stream,
        },
        fields: 'id,webViewLink',
      });

      this.logger.log(`File uploaded to Google Drive: ${response.data.id}`);
      return {
        id: response.data.id,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to Google Drive', error);
      return null;
    }
  }

  async createFolder(name: string, parentId?: string): Promise<string | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentId ? [parentId] : undefined,
        },
        fields: 'id',
      });

      this.logger.log(`Folder created in Google Drive: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to create folder in Google Drive', error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.drive.files.delete({
        fileId,
      });

      this.logger.log(`File deleted from Google Drive: ${fileId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete file from Google Drive', error);
      return false;
    }
  }

  async getFileStream(fileId: string): Promise<Readable | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media',
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get file from Google Drive', error);
      return null;
    }
  }

  async ensureFolderStructure(): Promise<{
    ordersFolder: string | null;
    measurementsFolder: string | null;
    installationsFolder: string | null;
    reportsFolder: string | null;
  }> {
    if (!this.isConfigured) {
      return {
        ordersFolder: null,
        measurementsFolder: null,
        installationsFolder: null,
        reportsFolder: null,
      };
    }

    const rootFolderId = this.configService.get('GOOGLE_DRIVE_FOLDER_ID');

    const ordersFolder = await this.createFolder('Orders', rootFolderId);
    const measurementsFolder = await this.createFolder('Measurements', rootFolderId);
    const installationsFolder = await this.createFolder('Installations', rootFolderId);
    const reportsFolder = await this.createFolder('Reports', rootFolderId);

    return {
      ordersFolder,
      measurementsFolder,
      installationsFolder,
      reportsFolder,
    };
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }
}