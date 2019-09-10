import {
    Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from './Location';
import { Rewardable } from './experience';

@Entity()
export class User implements Rewardable {
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
    battleExp!: number;

    @Column({ nullable: false, default: 0 })
    courierExp!: number;

    @Column({ nullable: false, default: 0 })
    exp!: number;

    @Column({ nullable: false, default: 0 })
    money!: number;

    @Column({ nullable: false, default: 0 })
    tradeExp!: number;
}
