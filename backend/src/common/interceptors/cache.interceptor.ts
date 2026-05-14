import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, from, tap } from 'rxjs';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async () => {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          await this.invalidateCache(request.path);
        }
      }),
    );
  }

  private async invalidateCache(path: string): Promise<void> {
    try {
      if (path.includes('/products')) {
        await this.cacheManager.del('products-all');
        await this.cacheManager.del('products-id');
        await this.cacheManager.del('products-search');
      }
      if (path.includes('/categories')) {
        await this.cacheManager.del('categories-all');
        await this.cacheManager.del('categories-id');
      }
      if (path.includes('/banners')) {
        await this.cacheManager.del('banners-all');
        await this.cacheManager.del('banners-id');
      }
      if (path.includes('/offer-cards')) {
        await this.cacheManager.del('offercards-all');
        await this.cacheManager.del('offercards-id');
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}
