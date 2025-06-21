import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Заголовок поста' })
  title: string;

  @ApiProperty({ description: 'Описание поста' })
  description: string;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ description: 'Обновлённый заголовок поста' })
  title?: string;

  @ApiPropertyOptional({ description: 'Обновлённое описание поста' })
  description?: string;
}