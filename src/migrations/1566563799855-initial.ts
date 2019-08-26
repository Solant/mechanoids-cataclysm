import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1566563799855 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO location (name, "isStartingZone") VALUES ('База 1', true);`);
        await queryRunner.query(`INSERT INTO location (name, "isStartingZone") VALUES ('База 2', false);`);
        await queryRunner.query(`INSERT INTO location (name, "isStartingZone") VALUES ('База 3', false);`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DELETE FROM location WHERE name='База 1';");
        await queryRunner.query("DELETE FROM location WHERE name='База 2';");
        await queryRunner.query("DELETE FROM location WHERE name='База 3';");
    }
}
