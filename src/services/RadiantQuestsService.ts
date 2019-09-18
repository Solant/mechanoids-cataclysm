import { getRepository } from 'typeorm';
import { left, right, Either } from 'fp-ts/lib/Either';

import { RadiantQuest } from '../models/RadiantQuest';
import { User } from '../models/User';

import { getExplorationLevel } from './ExperienceService';
import { Rewardable } from '../models/experience';

type EntityId = number | string;

export class RadiantQuestsService {
    static async canStartQuest(questId: string | number, userId: string | number): Promise<Either<string, number>> {
        const quest = await getRepository(RadiantQuest).findOneOrFail(questId);
        const user = await getRepository(User).findOneOrFail(userId);

        if (getExplorationLevel(user) < quest.lvlRestriction) {
            return left('Вы не можете начать этот квест');
        }

        return right(quest.baseDuration);
    }

    static async completeQuest(questId: string | number)
        : Promise<Either<string, { response: string, reward: Rewardable }>> {
        const quest = await getRepository(RadiantQuest).findOneOrFail(questId);

        let result = `Задание <b>${quest.name}</b> выполнено\n\n`;

        result += `Получено <b>${quest.money}</b> кристаллов\n`;
        result += `Получено <b>${quest.exp}</b> очков опыта\n`;
        result += `Получено <b>${quest.courierExp}</b> очков курьерского рейтинга\n`;
        result += `Получено <b>${quest.tradeExp}</b> очков торгового рейтинга\n`;
        result += `Получено <b>${quest.battleExp}</b> очков боевого рейтинга\n`;

        return right({ response: result, reward: quest });
    }

    static async getQuestInfo(questId: EntityId): Promise<{ response: string, id: EntityId }> {
        const quest = await getRepository(RadiantQuest).findOneOrFail(questId);

        const response = `<b>${quest.name}</b>
${quest.description}

За выполнение этого задания ты получишь:
<b>${quest.money}</b> кристаллов
<b>${quest.exp}</b> очков опыта
<b>${quest.courierExp}</b> очков курьерского рейтинга
<b>${quest.tradeExp}</b> очков торгового рейтинга
<b>${quest.battleExp}</b> очков боевого рейтинга
`;

        return { response, id: quest.id };
    }
}
