import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post/post.entity';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Настройка PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('PG_HOST'),
        port: Number(cfg.get('PG_PORT')),
        username: cfg.get('PG_USER'),
        password: cfg.get('PG_PASS'),
        database: cfg.get('PG_DB'),
        entities: [PostEntity],
        synchronize: false,
      }),
    }),

    PostModule,
  ],
})
export class AppModule {}