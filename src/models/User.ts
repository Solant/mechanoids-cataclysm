import {
    Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from './Location';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    chatId!: number;

    @Column()
    name!: string;

    @ManyToOne(() => Location)
    @JoinColumn()
    location!: Location;

    @Column({ nullable: false, default: 0 })
    explorationExp!: number;
}
