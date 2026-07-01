import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { DateRange, ExportFormat, ExportType } from './dto/export-data.dto';
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

  private getDateFromRange(dateRange: DateRange): Date | null {
    if (!dateRange || dateRange === DateRange.ALL) return null;
    const now = new Date();
    switch (dateRange) {
      case DateRange.LAST_WEEK:
        return new Date(now.setDate(now.getDate() - 7));
      case DateRange.LAST_MONTH:
        return new Date(now.setMonth(now.getMonth() - 1));
      case DateRange.LAST_3_MONTHS:
        return new Date(now.setMonth(now.getMonth() - 3));
      case DateRange.LAST_6_MONTHS:
        return new Date(now.setMonth(now.getMonth() - 6));
      default:
        return null;
    }
  }

  private buildDateFilter(dateRange: DateRange): any {
    const startDate = this.getDateFromRange(dateRange);
    if (!startDate) return {};
    return { createdAt: { $gte: startDate } };
  }

  async exportData(
    type: ExportType,
    format: ExportFormat,
    dateRange?: DateRange,
  ): Promise<{ data: any; filename: string }> {
    let data: any;
    let filename: string;

    switch (type) {
      case ExportType.USERS:
        data = await this.getUsersData(dateRange);
        filename = 'users';
        break;
      case ExportType.PRODUCTS:
        data = await this.getProductsData(dateRange);
        filename = 'products';
        break;
      case ExportType.ORDERS:
        data = await this.getOrdersData(dateRange);
        filename = 'orders';
        break;
      case ExportType.CATEGORIES:
        data = await this.getCategoriesData(dateRange);
        filename = 'categories';
        break;
      case ExportType.ALL:
        data = await this.getAllData(dateRange);
        filename = 'all-data';
        break;
      default:
        throw new Error('Invalid export type');
    }

    return { data, filename };
  }

  private async getUsersData(dateRange?: DateRange): Promise<any[]> {
    const dateFilter = this.buildDateFilter(dateRange || DateRange.ALL);
    const users = await this.userModel.aggregate([
      {
        $match: dateFilter,
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $lookup: {
          from: 'shippingaddresses',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$userId'] },
                    { $eq: ['$isDefault', true] },
                  ],
                },
              },
            },
            {
              $project: {
                fullName: 1,
                phone: 1,
                address: 1,
                city: 1,
                state: 1,
                pincode: 1,
                label: 1,
              },
            },
          ],
          as: 'addresses',
        },
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          defaultAddress: { $arrayElemAt: ['$addresses', 0] },
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          isVerified: 1,
          role: 1,
          orderCount: 1,
          defaultAddress: 1,
        },
      },
    ]);

    return users;
  }

  private async getProductsData(dateRange?: DateRange): Promise<any[]> {
    const dateFilter = this.buildDateFilter(dateRange || DateRange.ALL);
    const query: any = {};
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter.createdAt;
    }
    const products = await this.productModel
      .find(query)
      .populate('category', 'name')
      .select('-__v')
      .lean();
    return products;
  }

  private async getOrdersData(dateRange?: DateRange): Promise<any[]> {
    const dateFilter = this.buildDateFilter(dateRange || DateRange.ALL);
    const query: any = {};
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter.createdAt;
    }
    const orders = await this.orderModel
      .find(query)
      .populate('user', 'fullName email phone')
      .select('-__v')
      .lean();
    return orders;
  }

  private async getCategoriesData(dateRange?: DateRange): Promise<any[]> {
    const dateFilter = this.buildDateFilter(dateRange || DateRange.ALL);
    const query: any = {};
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter.createdAt;
    }
    const categories = await this.categoryModel.find(query).select('-__v').lean();
    return categories;
  }

  private async getAllData(dateRange?: DateRange): Promise<{
    users: any[];
    products: any[];
    orders: any[];
    categories: any[];
  }> {
    const [users, products, orders, categories] = await Promise.all([
      this.getUsersData(dateRange),
      this.getProductsData(dateRange),
      this.getOrdersData(dateRange),
      this.getCategoriesData(dateRange),
    ]);

    return { users, products, orders, categories };
  }

  async exportToFormat(
    type: ExportType,
    format: ExportFormat,
    dateRange?: DateRange,
  ): Promise<{ buffer: Buffer | string; contentType: string; filename: string }> {
    const { data, filename } = await this.exportData(type, format, dateRange);

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
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      switch (type) {
        case ExportType.USERS:
          this.renderUsersPdf(doc, data, pageWidth);
          break;
        case ExportType.PRODUCTS:
          this.renderProductsPdf(doc, data, pageWidth);
          break;
        case ExportType.CATEGORIES:
          this.renderCategoriesPdf(doc, data, pageWidth);
          break;
        case ExportType.ORDERS:
          this.renderOrdersPdf(doc, data, pageWidth);
          break;
        case ExportType.ALL:
          this.renderAllPdf(doc, data, pageWidth);
          break;
        default:
          doc.fontSize(20).text('Data Export Report', { align: 'center' });
          doc.moveDown();
          doc.fontSize(10).text(JSON.stringify(data, null, 2), { align: 'left', width: pageWidth });
      }

      doc.end();
    });
  }

  private renderUsersPdf(doc: any, users: any[], pageWidth: number): void {
    doc.fontSize(22).font('Helvetica-Bold').text('Users Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Total Users: ${users.length}`, { align: 'center' });
    doc.moveDown(1);

    users.forEach((user: any, index: number) => {
      const cardX = doc.page.margins.left;
      const cardY = doc.y;
      const cardWidth = pageWidth;
      const cardHeight = 110;

      // Card background
      doc
        .rect(cardX, cardY, cardWidth, cardHeight)
        .fill('#f8fafc')
        .stroke('#e2e8f0');

      // Card number badge
      doc.rect(cardX, cardY, 28, cardHeight).fill('#3b82f6');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text(String(index + 1), cardX + 8, cardY + 45);

      // Content
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10);
      doc.text('Name:', cardX + 36, cardY + 8);
      doc.font('Helvetica').fontSize(9);
      doc.text(user.fullName || 'N/A', cardX + 36, cardY + 22, { width: cardWidth - 160 });

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Email:', cardX + 36, cardY + 34);
      doc.font('Helvetica').fontSize(9);
      doc.text(user.email || 'N/A', cardX + 36, cardY + 48, { width: cardWidth - 160 });

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Phone:', cardX + 36, cardY + 60);
      doc.font('Helvetica').fontSize(9);
      doc.text(user.phone || 'N/A', cardX + 36, cardY + 74, { width: cardWidth - 160 });

      // Address section
      doc.font('Helvetica-Bold').fontSize(10);
      const addressLabel = user.defaultAddress ? 'Address:' : 'Address:';
      doc.text(addressLabel, cardX + 36, cardY + 86);
      doc.font('Helvetica').fontSize(9);
      if (user.defaultAddress) {
        const addr = user.defaultAddress;
        const addrText = [addr.address, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
        doc.text(addrText || 'N/A', cardX + 36, cardY + 98, { width: cardWidth - 160 });
      } else {
        doc.text('Not provided', cardX + 36, cardY + 98, { width: cardWidth - 160 });
      }

      // Right side - stats
      const rightX = cardX + cardWidth - 110;
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Role:', rightX, cardY + 8);
      doc.font('Helvetica').fontSize(9);
      doc.text((user.role || 'user').toUpperCase(), rightX, cardY + 20);

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Orders:', rightX, cardY + 32);
      doc.font('Helvetica').fontSize(9);
      doc.text(String(user.orderCount || 0), rightX, cardY + 44);

      const statusText = user.isVerified ? 'Verified' : 'Unverified';
      const statusBg = user.isVerified ? '#22c55e' : '#f59e0b';
      doc.rect(rightX, cardY + 56, 90, 16).fill(statusBg);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff').text(statusText, rightX + 8, cardY + 60);

      doc.y = cardY + cardHeight + 10;

      if (index < users.length - 1 && doc.y > doc.page.height - doc.page.margins.bottom - 80) {
        doc.addPage();
      }
    });
  }

  private renderProductsPdf(doc: any, products: any[], pageWidth: number): void {
    doc.fontSize(22).font('Helvetica-Bold').text('Products Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Total Products: ${products.length}`, { align: 'center' });
    doc.moveDown(1);

    products.forEach((product: any, index: number) => {
      const cardX = doc.page.margins.left;
      const cardY = doc.y;
      const cardWidth = pageWidth;
      const cardHeight = 130;

      // Card background
      doc.rect(cardX, cardY, cardWidth, cardHeight).fill('#f0fdf4').stroke('#bbf7d0');

      // Card number
      doc.rect(cardX, cardY, 28, cardHeight).fill('#22c55e');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text(String(index + 1), cardX + 8, cardY + 55);

      // Content
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10);
      doc.text('Product:', cardX + 36, cardY + 8);
      doc.font('Helvetica').fontSize(9);
      doc.text(product.name || 'N/A', cardX + 36, cardY + 22, { width: cardWidth - 160 });

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text(`Category: ${product.category?.name || 'N/A'}`, cardX + 36, cardY + 34);

      const displayPrice = product.offerPrice || product.price || 0;
      const originalPrice = product.price || 0;
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text(`Price: ₹${displayPrice}`, cardX + 36, cardY + 46);
      if (product.offerPrice && product.offerPrice < product.price) {
        doc.font('Helvetica').fontSize(8).fillColor('#ef4444');
        doc.text(`(Original: ₹${originalPrice})`, cardX + 100, cardY + 46);
        doc.fillColor('#000000');
      }

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text(`Stock: ${product.inStock !== false ? 'Available' : 'Out of Stock'}`, cardX + 36, cardY + 58);

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text(`Status: ${product.isActive ? 'Active' : 'Inactive'}`, cardX + 36, cardY + 70);

      // Badges for flags
      const badges: string[] = [];
      if (product.isTrending) badges.push('Trending');
      if (product.isPopular) badges.push('Popular');
      if (product.isRecommended) badges.push('Recommended');
      if (product.isImported) badges.push('Imported');
      doc.font('Helvetica').fontSize(8);
      doc.text(badges.length > 0 ? badges.join(' • ') : '', cardX + 36, cardY + 82, { width: cardWidth - 160 });

      // Description
      if (product.description) {
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text('Desc:', cardX + 36, cardY + 94);
        doc.font('Helvetica').fontSize(8);
        doc.text(product.description, cardX + 36, cardY + 106, { width: cardWidth - 160 });
      }

      // Right side details
      const rightX = cardX + cardWidth - 110;
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Weight:', rightX, cardY + 8);
      doc.font('Helvetica').fontSize(9);
      doc.text(product.weight || 'N/A', rightX, cardY + 20);

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Flavour:', rightX, cardY + 32);
      doc.font('Helvetica').fontSize(9);
      doc.text(product.flavour || 'N/A', rightX, cardY + 44);

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Sort:', rightX, cardY + 56);
      doc.font('Helvetica').fontSize(9);
      doc.text(String(product.sortOrder || 0), rightX, cardY + 68);

      doc.y = cardY + cardHeight + 10;

      if (index < products.length - 1 && doc.y > doc.page.height - doc.page.margins.bottom - 80) {
        doc.addPage();
      }
    });
  }

  private renderCategoriesPdf(doc: any, categories: any[], pageWidth: number): void {
    doc.fontSize(22).font('Helvetica-Bold').text('Categories Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Total Categories: ${categories.length}`, { align: 'center' });
    doc.moveDown(1);

    categories.forEach((category, index) => {
      const cardX = doc.page.margins.left;
      const cardY = doc.y;
      const cardWidth = pageWidth;

      // Card background
      doc.rect(cardX, cardY, cardWidth, 55).fill('#faf5ff').stroke('#e9d5ff');

      // Card number
      doc.rect(cardX, cardY, 28, 55).fill('#a855f7');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text(String(index + 1), cardX + 8, cardY + 18);

      // Content
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11);
      doc.text(category.name || 'N/A', cardX + 36, cardY + 10, { width: cardWidth - 140 });
      doc.font('Helvetica').fontSize(9);
      if (category.description) {
        doc.text(category.description, cardX + 36, cardY + 26, { width: cardWidth - 140 });
      }
      doc.font('Helvetica').fontSize(9);
      doc.text(`Sorted: ${category.sortOrder || 0}`, cardX + 36, cardY + 40);

      const activeColor = category.isActive ? '#22c55e' : '#94a3b8';
      doc.text(category.isActive ? 'Active' : 'Inactive', cardX + cardWidth - 70, cardY + 20);

      doc.y = cardY + 55 + 10;

      if (index < categories.length - 1 && doc.y > doc.page.height - doc.page.margins.bottom - 80) {
        doc.addPage();
      }
    });
  }

  private renderAllPdf(doc: any, allData: { users: any[]; products: any[]; orders: any[]; categories: any[] }, pageWidth: number): void {
    doc.fontSize(22).font('Helvetica-Bold').text('Complete Data Export', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Total: ${allData.users?.length || 0} users, ${allData.products?.length || 0} products, ${allData.categories?.length || 0} categories, ${allData.orders?.length || 0} orders`, { align: 'center' });
    doc.moveDown(1);

    if (allData.categories && allData.categories.length > 0) {
      doc.addPage();
      this.renderCategoriesPdf(doc, allData.categories, pageWidth);
    }
    if (allData.products && allData.products.length > 0) {
      doc.addPage();
      this.renderProductsPdf(doc, allData.products, pageWidth);
    }
    if (allData.users && allData.users.length > 0) {
      doc.addPage();
      this.renderUsersPdf(doc, allData.users, pageWidth);
    }
    if (allData.orders && allData.orders.length > 0) {
      doc.addPage();
      this.renderOrdersPdf(doc, allData.orders, pageWidth);
    }
  }

  private renderOrdersPdf(doc: any, orders: any[], pageWidth: number): void {
    doc.fontSize(22).font('Helvetica-Bold').text('Orders Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Total Orders: ${orders.length}`, { align: 'center' });
    doc.moveDown(1);

    orders.forEach((order, index) => {
      const user = order.user || {};
      const shipping = order.shippingAddress || {};
      const upi = order.upiPaymentDetails || {};
      const startY = doc.y;

      // Order header
      doc.fontSize(14).font('Helvetica-Bold').text(`Order #${index + 1}`, { align: 'left' });
      doc.moveDown(0.3);

      // Two column layout for customer and order info
      const leftX = doc.page.margins.left;
      const rightX = doc.page.margins.left + pageWidth / 2;
      const colWidth = pageWidth / 2 - 10;

      // Left column - Customer info
      doc.font('Helvetica-Bold').fontSize(10).text('Customer Info:', leftX, doc.y);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Name: ${user.fullName || 'N/A'}`, leftX, doc.y, { width: colWidth });
      doc.text(`Email: ${user.email || 'N/A'}`, leftX, doc.y, { width: colWidth });
      doc.text(`Phone: ${user.phone || 'N/A'}`, leftX, doc.y, { width: colWidth });

      // Right column - Order info
      doc.font('Helvetica-Bold').fontSize(10).text('Order Info:', rightX, startY + 20);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Order ID: ${order._id || 'N/A'}`, rightX, startY + 35, { width: colWidth });
      doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}`, rightX, doc.y, { width: colWidth });
      doc.text(`Status: ${(order.orderStatus || 'N/A').toUpperCase()}`, rightX, doc.y, { width: colWidth });
      
      const paymentStatusText = order.paymentStatus === 'verified' ? 'Paid' : (order.paymentStatus || 'N/A');
      doc.text(`Payment: ${paymentStatusText}`, rightX, doc.y, { width: colWidth });
      
      doc.y = Math.max(doc.y, startY + 60);

      // Shipping Address
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(10).text('Shipping Address:', leftX, doc.y);
      doc.font('Helvetica').fontSize(9);
      const addressLine = `${shipping.fullName || ''}, ${shipping.address || ''}, ${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}`;
      doc.text(addressLine, leftX, doc.y, { width: pageWidth });
      doc.y += 15;

      // Items table
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(10).text('Items:', leftX, doc.y);
      doc.y += 3;

      const tableTop = doc.y;
      const col1 = 30;
      const col2 = 170;
      const col3 = 260;
      const col4 = 330;

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Item', col1, tableTop, { width: 130 });
      doc.text('Qty', col2, tableTop, { width: 80 });
      doc.text('Price', col3, tableTop, { width: 60 });
      doc.text('Total', col4, tableTop, { width: 60 });
      
      doc.y = tableTop + 15;
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + pageWidth, doc.y).stroke();
      doc.y += 3;

      doc.font('Helvetica').fontSize(9);
      (order.items || []).forEach((item: any) => {
        const itemTotal = (item.offerPrice || item.price) * (item.quantity || 1);
        doc.text(item.name || 'Unknown', col1, doc.y, { width: 130 });
        doc.text(String(item.quantity || 1), col2, doc.y, { width: 80 });
        doc.text(`₹${item.price}`, col3, doc.y, { width: 60 });
        doc.text(`₹${itemTotal}`, col4, doc.y, { width: 60 });
        doc.y += 14;
      });

      doc.y += 3;
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + pageWidth, doc.y).stroke();
      doc.y += 5;

      // Totals
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Subtotal:', doc.page.margins.left + pageWidth - 200, doc.y, { width: 80 });
      doc.text(`₹${order.subtotal || 0}`, doc.page.margins.left + pageWidth - 120, doc.y, { width: 100 });
      doc.y += 14;
      doc.text('Total:', doc.page.margins.left + pageWidth - 200, doc.y, { width: 80 });
      doc.text(`₹${order.total || 0}`, doc.page.margins.left + pageWidth - 120, doc.y, { width: 100 });
      doc.y += 8;

      // Transaction info
      if (upi.transactionId) {
        doc.y += 3;
        doc.font('Helvetica').fontSize(9);
        doc.text(`Transaction ID: ${upi.transactionId}`, doc.page.margins.left, doc.y, { width: pageWidth });
        doc.y += 12;
        if (upi.referenceNo) {
          doc.text(`Reference No: ${upi.referenceNo}`, doc.page.margins.left, doc.y, { width: pageWidth });
          doc.y += 12;
        }
      }

      // Separator
      doc.y += 5;
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + pageWidth, doc.y).stroke();
      doc.y += 15;

      // New page if needed
      if (index < orders.length - 1 && doc.y > doc.page.height - doc.page.margins.bottom - 100) {
        doc.addPage();
      }
    });
  }
}