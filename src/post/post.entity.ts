import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('post')
export class PostEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() title: string;
    @Column() description: string;
    @CreateDateColumn() createdAt: Date;
    @UpdateDateColumn() updatedAt: Date;
}
