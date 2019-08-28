import { MigrationInterface, QueryRunner } from "typeorm";

export class DeferredMessage1566986569634 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "deferred_message" ("id" SERIAL NOT NULL, "chatId" integer NOT NULL, "text" character varying NOT NULL, "extra" character varying NOT NULL, "date" TIMESTAMP NOT NULL, CONSTRAINT "PK_de2d5638e3bb2a8b22a829e5fea" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "deferred_message"`);
    }
}
