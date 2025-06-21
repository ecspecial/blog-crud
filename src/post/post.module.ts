import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheModule } from '@nestjs/cache-manager';

// Импорт сущности PostEntity, определяет структуру таблицы "post"
import { PostEntity } from './post.entity';

// Импорт контроллера для обработки HTTP-запросов
import { PostController } from './post.controller';

// Импорт сервиса с логикой CRUD запросов и кэша
import { PostService } from './post.service';
import { CacheDebugController } from './cache-debug.controller';

@Module({
    // Подключаем сущность PostEntity к TypeORM внутри этого модуля
     imports: [
        TypeOrmModule.forFeature([PostEntity]),
        CacheModule.register(),  // <-- Register CacheModule to inject CACHE_MANAGER
    ],

    // Регистрируем контроллер для обработки маршрутов /posts
    controllers: [PostController, CacheDebugController],

    // Регистрируем сервис, который будет использоваться внутри контроллера
    providers: [PostService],
})
export class PostModule {}
