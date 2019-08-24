import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1566563799855 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("INSERT INTO location (name) VALUES ('База 1');");
        await queryRunner.query("INSERT INTO location (name) VALUES ('База 2');");
        await queryRunner.query("INSERT INTO location (name) VALUES ('База 3');");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DELETE FROM location WHERE name='База 1';");
        await queryRunner.query("DELETE FROM location WHERE name='База 2';");
        await queryRunner.query("DELETE FROM location WHERE name='База 3';");
    }
}
