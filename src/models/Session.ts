import {
    Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    userId!: number;

    @Column({ nullable: false })
    chatId!: number;

    @Column({ nullable: false, default: '{}' })
    data!: string;
}
