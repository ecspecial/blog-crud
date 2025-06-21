import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis'; // Используем ioredis для взаимодействия с Redis

import { PostEntity } from './post.entity';
import { CreatePostDto, UpdatePostDto } from './post.dto';

@Injectable()
export class PostService {
    private readonly CACHE_TTL = 600; // Время жизни кеша в секундах (10 минут)
    private readonly MAX_STEP = 10;   // Максимальное количество постов на странице

    private readonly redis: Redis;

    constructor(@InjectRepository(PostEntity) private repo: Repository<PostEntity>) {
        // Инициализация клиента Redis
        this.redis = new Redis({
        host: '127.0.0.1',
        port: 6379,
        });
    }

    /** Получить все посты с пагинацией (кешировать по post_{id}) */
    async findAll(page = 1, step = this.MAX_STEP) {
        if (step > this.MAX_STEP) {
        throw new BadRequestException(`Maximum step value is ${this.MAX_STEP}`);
        }

        const skip = (page - 1) * step;
        const ids = await this.repo.find({
        select: ['id'],
        order: { createdAt: 'DESC' },
        skip,
        take: step,
        });

        const result: string[] = [];  // Храним строки

        for (const { id } of ids) {
        const key = `post_${id}`;
        let postFromCache = await this.redis.get(key); // Получить данные из Redis

        if (postFromCache) {
            console.log(`[CACHE] Hit for ${key}`);
        } else {
            const postFromDb = await this.repo.findOneBy({ id });  // Получить из БД, если нет в Redis
            if (postFromDb) {
            // Cache the post as a string in Redis
            await this.redis.set(key, JSON.stringify(postFromDb), 'EX', this.CACHE_TTL);
            console.log(`[CACHE] Miss for ${key} — loaded from DB`);
            postFromCache = JSON.stringify(postFromDb);  // Сохраняем сериализованную строку
            }
        }

        if (postFromCache) result.push(postFromCache);  // Сохраняем пост как строку (сырые данные JSON)
        }

        return result;
    }

    /** Получить один пост по ID */
    async findOne(id: number) {
        const key = `post_${id}`;
        let postFromCache = await this.redis.get(key); // Получить данные из Redis

        if (!postFromCache) {
        const postFromDb = await this.repo.findOneBy({ id });
        if (!postFromDb) throw new NotFoundException(`Post with ID ${id} not found`);
        await this.redis.set(key, JSON.stringify(postFromDb), 'EX', this.CACHE_TTL); // Кешируем пост как строку
        postFromCache = JSON.stringify(postFromDb);  // Сохраняем пост как строку
        } else {
        console.log(`[CACHE] Hit for ${key}`);
        }

        return postFromCache;  // Возвращаем пост как строку (сырые данные JSON)
    }

    /** Создать новый пост */
    async create(dto: CreatePostDto) {
        const post = this.repo.create(dto);
        await this.repo.save(post);
        await this.redis.set(`post_${post.id}`, JSON.stringify(post), 'EX', this.CACHE_TTL); // Кешируем новый пост как строку
        return post;
    }

    /** Обновить существующий пост */
    async update(id: number, dto: UpdatePostDto) {
        const post = await this.repo.findOneBy({ id });
        if (!post) throw new NotFoundException(`Post with ID ${id} not found`);

        Object.assign(post, dto);
        await this.repo.save(post);

        // Обновить кеш для обновленного поста
        await this.redis.set(`post_${id}`, JSON.stringify(post), 'EX', this.CACHE_TTL);
        return post;
    }

    /** Удалить пост */
    async remove(id: number) {
        const res = await this.repo.delete(id);

        // Удалить пост из кеша Redis
        await this.redis.del(`post_${id}`);

        return { deleted: !!res.affected };
    }
}