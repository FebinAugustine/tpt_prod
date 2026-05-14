export class PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit?: number;

  // Alias key for backward compatibility, e.g., 'users' or 'orders'
  private aliasKey?: string;

  constructor(
    items: T[],
    total: number,
    page: number,
    totalPages: number,
    limit?: number,
    aliasKey?: string,
  ) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.totalPages = totalPages;
    this.limit = limit;
    this.aliasKey = aliasKey;
  }

  toJSON() {
    const base = {
      items: this.items,
      total: this.total,
      page: this.page,
      totalPages: this.totalPages,
    };
    if (this.limit !== undefined) {
      base['limit'] = this.limit;
    }
    if (this.aliasKey) {
      base[this.aliasKey] = this.items;
    }
    return base;
  }
}
