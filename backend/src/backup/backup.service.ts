import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { ExportFormat, ExportType } from './dto/export-data.dto';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async exportData(
    type: ExportType,
    format: ExportFormat,
  ): Promise<{ data: any; filename: string }> {
    let data: any;
    let filename: string;

    switch (type) {
      case ExportType.USERS:
        data = await this.getUsersData();
        filename = 'users';
        break;
      case ExportType.PRODUCTS:
        data = await this.getProductsData();
        filename = 'products';
        break;
      case ExportType.ORDERS:
        data = await this.getOrdersData();
        filename = 'orders';
        break;
      case ExportType.CATEGORIES:
        data = await this.getCategoriesData();
        filename = 'categories';
        break;
      case ExportType.ALL:
        data = await this.getAllData();
        filename = 'all-data';
        break;
      default:
        throw new Error('Invalid export type');
    }

    return { data, filename };
  }

  private async getUsersData(): Promise<any[]> {
    const users = await this.userModel
      .find()
      .select('-refreshTokens -__v')
      .lean();
    return users;
  }

  private async getProductsData(): Promise<any[]> {
    const products = await this.productModel
      .find()
      .populate('category', 'name')
      .lean();
    return products;
  }

  private async getOrdersData(): Promise<any[]> {
    const orders = await this.orderModel
      .find()
      .populate('user', 'fullName email')
      .lean();
    return orders;
  }

  private async getCategoriesData(): Promise<any[]> {
    const categories = await this.categoryModel.find().lean();
    return categories;
  }

  private async getAllData(): Promise<{
    users: any[];
    products: any[];
    orders: any[];
    categories: any[];
  }> {
    const [users, products, orders, categories] = await Promise.all([
      this.getUsersData(),
      this.getProductsData(),
      this.getOrdersData(),
      this.getCategoriesData(),
    ]);

    return { users, products, orders, categories };
  }

  async exportToFormat(
    type: ExportType,
    format: ExportFormat,
  ): Promise<{ buffer: Buffer | string; contentType: string; filename: string }> {
    const { data, filename } = await this.exportData(type, format);

    switch (format) {
      case ExportFormat.JSON:
        return {
          buffer: JSON.stringify(data, null, 2),
          contentType: 'application/json',
          filename: `${filename}.json`,
        };
      case ExportFormat.EXCEL:
        return {
          buffer: await this.exportToExcel(data, type),
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: `${filename}.xlsx`,
        };
      case ExportFormat.PDF:
        return {
          buffer: await this.exportToPdf(data, type),
          contentType: 'application/pdf',
          filename: `${filename}.pdf`,
        };
      default:
        throw new Error('Unsupported format');
    }
  }

  private async exportToExcel(data: any, type: ExportType): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    let flattenedData: any[];

    if (type === ExportType.ALL) {
      // For 'all' type, create separate sheets
      const allData = data as {
        users: any[];
        products: any[];
        orders: any[];
        categories: any[];
      };

      // Users sheet
      if (allData.users.length > 0) {
        const userSheet = workbook.addWorksheet('Users');
        userSheet.columns = Object.keys(allData.users[0]).map((key) => ({
          header: key,
          key,
          width: 20,
        }));
        allData.users.forEach((item) => userSheet.addRow(item));
      }

      // Products sheet
      if (allData.products.length > 0) {
        const productSheet = workbook.addWorksheet('Products');
        productSheet.columns = Object.keys(allData.products[0]).map((key) => ({
          header: key,
          key,
          width: 25,
        }));
        allData.products.forEach((item) => productSheet.addRow(item));
      }

      // Orders sheet
      if (allData.orders.length > 0) {
        const orderSheet = workbook.addWorksheet('Orders');
        orderSheet.columns = Object.keys(allData.orders[0]).map((key) => ({
          header: key,
          key,
          width: 25,
        }));
        allData.orders.forEach((item) => orderSheet.addRow(item));
      }

      // Categories sheet
      if (allData.categories.length > 0) {
        const categorySheet = workbook.addWorksheet('Categories');
        categorySheet.columns = Object.keys(allData.categories[0]).map(
          (key) => ({
            header: key,
            key,
            width: 20,
          }),
        );
        allData.categories.forEach((item) => categorySheet.addRow(item));
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }

    flattenedData = data;

    if (flattenedData.length === 0) {
      worksheet.columns = [{ header: 'No Data', key: 'noData', width: 20 }];
      worksheet.addRow({ noData: 'No records found' });
    } else {
      worksheet.columns = Object.keys(flattenedData[0]).map((key) => ({
        header: key,
        key,
        width: 25,
      }));
      flattenedData.forEach((item) => worksheet.addRow(item));
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async exportToPdf(data: any, type: ExportType): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument();

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Data Export Report', { align: 'center' });
      doc.moveDown();

      let flatData: any[];
      let title = '';

      if (type === ExportType.ALL) {
        const allData = data as {
          users: any[];
          products: any[];
          orders: any[];
          categories: any[];
        };

        let yOffset = 100;

        ['users', 'products', 'orders', 'categories'].forEach((section) => {
          const sectionData = allData[section as keyof typeof allData];
          if (sectionData && sectionData.length > 0) {
            doc.fontSize(14).text(
              `${section.toUpperCase()} (${sectionData.length} records)`,
              50,
              yOffset,
            );
            yOffset += 20;
          }
        });

        doc.moveDown();
        doc.text(JSON.stringify(data, null, 2), {
          align: 'left',
          width: 500,
        });
      } else {
        flatData = data;

        doc.fontSize(14).text(`${type.toUpperCase()} EXPORT`, 50, 80);
        doc.moveDown();

        const jsonStr = JSON.stringify(flatData, null, 2);
        doc.fontSize(8).text(jsonStr, {
          align: 'left',
          width: 500,
          continued: true,
        });
      }

      doc.end();
    });
  }
}