import {
    Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';
import { Rewardable } from './experience';

@Entity()
export class RadiantQuest implements Rewardable {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false, unique: true })
    code!: string;

    @Column({ nullable: false })
    name!: string;

    @Column({ nullable: false })
    description!: string;

    @Column({ nullable: false })
    baseDuration!: number;

    @Column({ nullable: false })
    lvlRestriction!: number;

    @Column({ nullable: false, default: 0 })
    battleExp!: number;

    @Column({ nullable: false, default: 0 })
    reward!: number;

    @Column({ nullable: false, default: 0 })
    courierExp!: number;

    @Column({ nullable: false, default: 0 })
    exp!: number;

    @Column({ nullable: false, default: 0 })
    money!: number;

    @Column({ nullable: false, default: 0 })
    tradeExp!: number;
}
