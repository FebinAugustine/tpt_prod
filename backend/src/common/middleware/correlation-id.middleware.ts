import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      req.headers['x-correlation-id'] || req.headers['x-request-id'] || uuidv4();
    
    // Attach correlation ID to request for use in services/controllers
    (req as any).correlationId = correlationId;
    
    // Set correlation ID in response header
    res.setHeader('x-correlation-id', correlationId);
    
    next();
  }
}