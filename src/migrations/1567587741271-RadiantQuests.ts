import { MigrationInterface, QueryRunner } from "typeorm";

export class RadiantQuests1567587741271 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "radiant_quest" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "reward" integer NOT NULL, "lvlRestriction" integer NOT NULL, CONSTRAINT "UQ_0b1532090a8bea1bffcacc8f14e" UNIQUE ("code"), CONSTRAINT "PK_9a09765070decfd40787eee9d5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "radiant_quest" ("code", "name", "description", "reward", "lvlRestriction") VALUES('find_mech', 'Найти механоида', 'В данный момент у нас нет доуступа к спасателям, а наши ресурсы ограничены. Привези механоида чей глайдер был уничтожен.', 10, 1)`);

        await queryRunner.query(`ALTER TABLE "user" ADD "explorationExp" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "explorationExp"`);
        await queryRunner.query(`DROP TABLE "radiant_quest"`);
    }
}
