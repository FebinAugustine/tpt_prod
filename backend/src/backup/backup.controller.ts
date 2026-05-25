import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { BackupService } from './backup.service';
import { ExportFormat, ExportType } from './dto/export-data.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller({ path: 'backup', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  async exportData(
    @Query('format') format: ExportFormat,
    @Query('type') type: ExportType,
    @Res() res: Response,
  ) {
    try {
      const { buffer, contentType, filename } =
        await this.backupService.exportToFormat(type, format);

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.isBuffer(buffer)
          ? buffer.length
          : Buffer.byteLength(buffer),
      });

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Export failed',
        error: error.message,
      });
    }
  }

  @Get('preview')
  async previewData(@Query('type') type: ExportType, @Res() res: Response) {
    try {
      const { data, filename } = await this.backupService.exportData(
        type,
        ExportFormat.JSON,
      );

      res.status(HttpStatus.OK).json({
        type,
        filename,
        count: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
        data,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Preview failed',
        error: error.message,
      });
    }
  }
}