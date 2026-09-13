import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import pino from 'pino';
import { ASYNC_STORAGE } from '../../common/constants/injection.js';
import { LoggerStore } from './interfaces/logger_store.interface.js';

@Injectable()
export class LoggerServiceBuilder {
  constructor(
    @Inject(ASYNC_STORAGE)
    private readonly als: AsyncLocalStorage<LoggerStore>,
  ) {}

  build(): LoggerService {
    const root = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      mixin: () => {
        const store = this.als.getStore();
        return store?.requestId ? { requestId: store.requestId } : {};
      },
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    });

    return {
      log: (message, context) => {
        root.info(context ? { context } : {}, message as string);
      },
      error: (message, trace, context) => {
        root.error({ context, trace }, message as string);
      },
      warn: (message, context) => {
        root.warn(context ? { context } : {}, message as string);
      },
      debug: (message, context) => {
        root.debug(context ? { context } : {}, message as string);
      },
      verbose: (message, context) => {
        root.trace(context ? { context } : {}, message as string);
      },
      fatal: (message, context) => {
        root.fatal(context ? { context } : {}, message as string);
      },
    } as LoggerService;
  }
}
