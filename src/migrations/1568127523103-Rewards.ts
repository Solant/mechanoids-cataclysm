import { MigrationInterface, QueryRunner } from "typeorm";

export class Rewards1568127523103 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "explorationExp"`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ADD "battleExp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ADD "courierExp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ADD "exp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ADD "money" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ADD "tradeExp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "user" ADD "battleExp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "user" ADD "courierExp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "user" ADD "exp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "user" ADD "money" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "user" ADD "tradeExp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ALTER COLUMN "baseDuration" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ALTER COLUMN "reward" SET DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "radiant_quest" ALTER COLUMN "reward" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" ALTER COLUMN "baseDuration" SET DEFAULT 300000`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tradeExp"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "money"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "exp"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "courierExp"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "battleExp"`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" DROP COLUMN "tradeExp"`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" DROP COLUMN "money"`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" DROP COLUMN "exp"`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" DROP COLUMN "courierExp"`);
        await queryRunner.query(`ALTER TABLE "radiant_quest" DROP COLUMN "battleExp"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "explorationExp" integer NOT NULL DEFAULT 0`);
    }
}
