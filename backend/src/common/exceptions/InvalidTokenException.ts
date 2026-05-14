import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTokenException extends HttpException {
  constructor(message = 'Invalid token') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}