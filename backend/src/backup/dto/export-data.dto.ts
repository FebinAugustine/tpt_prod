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

export enum DateRange {
  ALL = 'all',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_3_MONTHS = 'last_3_months',
  LAST_6_MONTHS = 'last_6_months',
}

export class ExportDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsEnum(ExportType)
  type: ExportType;

  @IsOptional()
  @IsEnum(ExportFormat)
  formatOverride?: ExportFormat;

  @IsOptional()
  @IsEnum(DateRange)
  dateRange?: DateRange;
}