import {
  Controller, Get, Post, Put, Delete, Param, Body, Query
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PostRto } from './post.rto';

@ApiTags('Посты')
@Controller('posts')

export class PostController {
    // Подключаем зависимости сервиса (PostService)
    constructor(private svc: PostService) {}

    // Получить один пост по id
    // Пример: GET /posts/1
    @Get()
    @ApiQuery({ name: 'page', required: false, description: 'Номер страницы (по умолчанию 1)' })
    @ApiQuery({ name: 'step', required: false, description: 'Количество постов на страницу (макс. 10)' })
    @ApiResponse({ status: 200, type: [PostRto] })
    findAll(@Query('page') page: number, @Query('step') step: number) {
        return this.svc.findAll(page || 1, step || 10);
    }

    // Создать новый пост
    // Пример: POST /posts  с телом { title, description }
    @Get(':id')
    @ApiResponse({ status: 200, type: PostRto })
    findOne(@Param('id') id: number) {
        return this.svc.findOne(id);
    }

    // Создать новый пост
    // Пример: POST /posts  с телом { title, description }
    @Post()
    @ApiResponse({ status: 201, type: PostRto })
    create(@Body() dto: CreatePostDto) {
        return this.svc.create(dto);
    }

    // Обновить пост по id
    // Пример: PUT /posts/1 с телом { title?, description? }
    @Put(':id')
    @ApiResponse({ status: 200, type: PostRto })
    update(@Param('id') id: number, @Body() dto: UpdatePostDto) {
        return this.svc.update(+id, dto);
    }

    // Удалить пост по id
    // Пример: DELETE /posts/1
     @Delete(':id')
    @ApiResponse({ status: 200, description: 'Удалён ли пост' })
    remove(@Param('id') id: number) {
        return this.svc.remove(+id);
    }
}
