import { ApiProperty } from '@nestjs/swagger';

export class PostRto {
  @ApiProperty({ description: 'ID поста' })
  id: number;

  @ApiProperty({ description: 'Заголовок поста' })
  title: string;

  @ApiProperty({ description: 'Описание поста' })
  description: string;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления' })
  updatedAt: Date;
}