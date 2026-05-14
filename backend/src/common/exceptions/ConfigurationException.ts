import { HttpException, HttpStatus } from '@nestjs/common';

export class ConfigurationException extends HttpException {
  constructor(message = 'Configuration error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
