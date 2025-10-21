import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  @Post('/uploadImage')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      filename: file.filename,
      url: `http://localhost:3000/uploads/${file.filename}`,
    };
  }
}
