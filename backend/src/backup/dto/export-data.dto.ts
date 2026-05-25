import { IsEnum, IsOptional } from 'class-validator';

export enum ExportFormat {
  JSON = 'json',
  EXCEL = 'excel',
  PDF = 'pdf',
}

export enum ExportType {
  USERS = 'users',
  PRODUCTS = 'products',
  ORDERS = 'orders',
  CATEGORIES = 'categories',
  ALL = 'all',
}

export class ExportDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsEnum(ExportType)
  type: ExportType;

  @IsOptional()
  @IsEnum(ExportFormat)
  formatOverride?: ExportFormat;
}