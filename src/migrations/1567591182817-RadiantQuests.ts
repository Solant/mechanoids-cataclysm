import { MigrationInterface, QueryRunner } from "typeorm";

export class RadiantQuests1567591182817 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "radiant_quest" ADD "baseDuration" integer NOT NULL DEFAULT 300000`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "radiant_quest" DROP COLUMN "baseDuration"`);
    }
}
