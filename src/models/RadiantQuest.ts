import {
    Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RadiantQuest {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false, unique: true })
    code!: string;

    @Column({ nullable: false })
    name!: string;

    @Column({ nullable: false })
    description!: string;

    @Column({ nullable: false })
    reward!: number;

    @Column({ nullable: false })
    baseDuration!: number;

    @Column({ nullable: false })
    lvlRestriction!: number;
}
