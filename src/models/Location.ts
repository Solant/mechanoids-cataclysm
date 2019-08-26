import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Location {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    name!: string;

    @Column({ nullable: false })
    isStartingZone!: boolean;
}
