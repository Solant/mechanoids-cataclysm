import { MigrationInterface, QueryRunner } from "typeorm";

export class Session1566563799852 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "session" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "chatId" integer NOT NULL, "data" character varying NOT NULL DEFAULT '{}', CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "session"`);
    }
}
