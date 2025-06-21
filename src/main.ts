import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import Redis from 'ioredis';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());

  /* Тестовая настройка Redis */
  const redis = new Redis({
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  // Запись в Redis
  await redis.set('healthcheck', 'redis-ok', 'EX', 30);
  console.log('[Redis] healthcheck →', await redis.get('healthcheck'));

  // Проверка соединения с помощью PING
  console.log('[Redis] PING →', await redis.ping());

  // Закрытие соединения с Redis после теста
  await redis.quit();

  /* Настройка Swagger */
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API for managing blog posts with Redis caching')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  /* Запуск приложения */
  await app.listen(3000, '0.0.0.0');
}

bootstrap();