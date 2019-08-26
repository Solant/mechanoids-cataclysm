import { MigrationInterface, QueryRunner } from 'typeorm';

export class StartingZoneFlag1566818818452 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE "location" ADD "isStartingZone" boolean NOT NULL DEFAULT false');
        await queryRunner.query('UPDATE "location" SET "isStartingZone" = true WHERE "name" = \'База 1\'');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE "location" DROP COLUMN "isStartingZone"');
    }
}
