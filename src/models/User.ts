import {
    Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from './Location';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToOne(() => Location)
    @JoinColumn()
    location!: Location;
}
