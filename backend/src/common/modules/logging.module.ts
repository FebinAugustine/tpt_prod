import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule, Params } from 'nestjs-pino';
import pino from 'pino';
import { RotatingStream } from '../utils/rotating-stream.util';

@Module({})
export class LoggingModule {
  static forRoot(): DynamicModule {
    return {
      module: LoggingModule,
      imports: [
        LoggerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: async (
            configService: ConfigService,
          ): Promise<Params> => {
            const logLevel =
              configService.get<string>('logging.level') || 'info';
            const logDir =
              configService.get<string>('logging.directory') || 'logs';
            const retentionDays =
              configService.get<number>('logging.retentionDays') || 7;
            const isProduction = process.env.NODE_ENV === 'production';

            // Create daily rotating file stream for combined logs
            const combinedStream = new RotatingStream('combined.log', {
              interval: '1d',
              path: logDir,
              maxFiles: retentionDays,
            });

            // Create daily rotating file stream for errors only
            const errorStream = new RotatingStream('error.log', {
              interval: '1d',
              path: logDir,
              maxFiles: retentionDays,
            });

            // Build a multi-destination stream for files
            const fileDest = pino.multistream(
              [
                { stream: combinedStream, level: 'trace' },
                { stream: errorStream, level: 'error' },
              ],
              { dedupe: true },
            );

            const pinoHttpOptions: Record<string, any> = {
              level: logLevel,
              redact: {
                paths: [
                  'req.headers.cookie',
                  'req.headers.authorization',
                  'req.headers["set-cookie"]',
                  'res.headers["set-cookie"]',
                  'req.body',
                  'res.body',
                ],
                remove: true,
              },
              customLogLevel: (res: any) => {
                const status = res?.statusCode ?? 200;
                if (status >= 500) return 'fatal';
                if (status >= 400) return 'warn';
                return 'info';
              },
              serializers: {
                req: (req: any) => ({
                  method: req.method,
                  url: req.url,
                  correlationId:
                    req.headers['x-correlation-id'] ||
                    req.headers['x-request-id'] ||
                    req.correlationId ||
                    'unknown',
                }),
                res: (res: any) => ({
                  statusCode: res.statusCode,
                }),
              },
            };

            // In production: log to file only. In dev: also use pino-pretty
            if (!isProduction) {
              const prettyStream = require('pino-pretty')({
                colorize: true,
                translateTime: 'SYS:standard',
              });

              const prettyDest = pino.multistream(
                [
                  { stream: fileDest, level: 'trace' },
                  { stream: prettyStream, level: 'debug' },
                ],
                { dedupe: true },
              );

              return {
                pinoHttp: [
                  pinoHttpOptions,
                  prettyDest as any,
                ] as [Record<string, any>, pino.DestinationStream],
                exclude: ['/health', '/favicon.ico'],
              };
            }

            return {
              pinoHttp: [
                pinoHttpOptions,
                fileDest as any,
              ] as [Record<string, any>, pino.DestinationStream],
              exclude: ['/health', '/favicon.ico'],
            };
          },
        }),
      ],
    };
  }
}