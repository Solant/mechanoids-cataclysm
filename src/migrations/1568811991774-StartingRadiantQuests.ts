import { MigrationInterface, QueryRunner } from 'typeorm';

export class StartingRadiantQuests1568811991774 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "radiant_quest"
            ("code", "lvlRestriction", "baseDuration", "exp", "money", "courierExp", "name", "description")
        VALUES
            ('find_cargo', 1, 420000, 11, 157, 11, 'Найти потерянный груз', 'Один из наших курьеров был вынужден выкинуть часть своего груза во время доставки. Необходимо найти груз и привезти его сюда.'),
            ('deliver_cargo', 1, 240000, 6, 90, 6, 'Доставить груз', 'Необходимо доставить контейнер в другое строение по заранее проложенному маршруту.');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "radiant_quest" WHERE "code" = 'find_cargo'`);
        await queryRunner.query(`DELETE FROM "radiant_quest" WHERE "code" = 'deliver_cargo'`);
    }
}
