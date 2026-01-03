import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PgSession = connectPgSimple(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  const corsOrigin = configService.get<string>('corsOrigin') || 'http://localhost:3000';
  const dbUrl = configService.get<string>('database.url');
  const sessionConfig = configService.get('session');

  if (!dbUrl) {
    throw new Error('DATABASE_URL is required');
  }

  if (!sessionConfig?.secret) {
    throw new Error('SESSION_SECRET is required');
  }

  // Session configuration
  app.use(
    session({
      store: new PgSession({
        conString: dbUrl,
        tableName: 'session',
        createTableIfMissing: true,
      }),
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      name: 'sessionId',
      cookie: {
        ...sessionConfig.cookie,
        maxAge: sessionConfig.maxAge,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
}

bootstrap();

