import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Logger } from 'nestjs-pino';

interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    // Skip logging for browser probing requests
    if (path?.startsWith('/.well-known/')) {
      response.status(404).json({ statusCode: 404, message: 'Not Found' });
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: Array.isArray(message) ? message[0] : message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path,
    };

    this.logger.error(`${status} - ${message} - ${path}`);

    response.status(status).json(errorResponse);
  }
}
