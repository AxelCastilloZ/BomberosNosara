import { Injectable } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Return the filename for database storage
    return file.filename;
  }

  async deleteFile(filename: string): Promise<boolean> {
    const filePath = join(process.cwd(), 'uploads', filename);
    
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
        return true;
      } catch (error) {
        console.error('Error deleting file:', error);
        return false;
      }
    }
    
    return false;
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async getFileInfo(filename: string): Promise<{ exists: boolean; path: string; url: string }> {
    const filePath = join(process.cwd(), 'uploads', filename);
    const exists = existsSync(filePath);
    
    return {
      exists,
      path: filePath,
      url: this.getFileUrl(filename),
    };
  }
} 