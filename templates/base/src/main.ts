import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'nestjs-redis-client';
import { AppModule } from './app.module.js';
import { ResponseFormatterInterceptor } from './common/interceptors/response-formatter.interceptor.js';
import { HttpExceptionFilter } from './common/filter/httpException.filter.js';
import { LoggerServiceBuilder } from './monitoring/logger/logger.service.js';
import { AppClusterService } from './infrastructure/clusters/app.clusterize.js';
import { createSessionMiddleware } from './core/authentication/session/session.middleware.js';
import { SessionRequest } from './core/authentication/types/session-request.type.js';
import { CsrfService } from './common/modules/csrf/csrf.service.js';

async function bootstrap() {
  // the cors will be changed to the front end url  in production environnement
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5372',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
    bufferLogs: true, //So nestjs can log things during init
  });

  const logger = app.get(LoggerServiceBuilder).build();
  app.useLogger(logger);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        },
      },
    }),
  );

  app.use(cookieParser());

  app.use(
    createSessionMiddleware(app.get(ConfigService), app.get(RedisService)),
  );

  const csrfService = app.get(CsrfService);
  const csrfProtection = csrfService.middleware();

  const CSRF_FREE_PATHS = [
    '/api/v1/authentication/login',
    '/api/v1/authentication/register',
    '/api/v1/authentication/oauth/google',
    '/api/v1/authentication/oauth/google/callback',
    '/graphql',
  ];

  app.use((req: SessionRequest, res, next) => {
    if (
      CSRF_FREE_PATHS.some(
        (path) => req.path === path || req.path.startsWith(`${path}/`),
      )
    ) {
      return next();
    }
    return csrfProtection(req, res, next);
  });

  app.useGlobalInterceptors(new ResponseFormatterInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  //FILTERS
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalFilters(new CustomWsExceptionFilter());
  app.enableShutdownHooks();
  //Those to are for handling the shutdown of the server
  process.on('SIGINT', () => {
    logger.log('Received SIGINT. Shutting down gracefully...');
    app
      .close()
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error while shutting down gracefully:', err);
      });
  });
  process.on('SIGTERM', () => {
    logger.log('Received SIGTERM. Shutting down gracefully...');
    app
      .close()
      .then(() => {
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
      });
  });
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
  });

  // Api versioning and global prefix
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api', { exclude: ['/api-docs', '/api-docs-json'] });

  //SWAGGER DOCS BUILDER
  const config = new DocumentBuilder()
    .setTitle('Core Api Documentation')
    .setDescription(
      'The API documentation. POST/PUT/PATCH/DELETE requests require a valid CSRF token in the x-csrf-token header. Request one from GET /api/v1/authentication/csrf.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      name: 'x-csrf-token',
      in: 'header',
      description: 'CSRF token obtained from GET /api/v1/authentication/csrf.',
      required: true,
      schema: { type: 'string' },
    })
    .addTag('Core')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/api-docs',
    apiReference({
      theme: 'solarized',
      content: document,
    }),
  );
  //RUNNING THE APPLICATION
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
const cluserizeApp =
  (process.env.CLUSTERIZE_APP || 'false').toLowerCase() === 'true';

if (cluserizeApp) {
  AppClusterService.clusterize(async () => {
    await bootstrap();
  });
} else {
  await bootstrap()
    .then(() => {
      console.log(
        `Application is running on: ${process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`}`,
      );
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
