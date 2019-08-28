import {
    Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DeferredMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    chatId!: number;

    @Column({ nullable: false })
    text!: string;

    @Column({ nullable: false })
    extra!: string;

    @Column({ nullable: false })
    date!: Date;
}
