import { getRepository } from 'typeorm';
import { left, right, Either } from 'fp-ts/lib/Either';

import { RadiantQuest } from '../models/RadiantQuest';
import { User } from '../models/User';

import { getExplorationLevel } from './ExperienceService';

export class RadiantQuestsService {
    static async canStartQuest(questId: string | number, userId: string | number): Promise<Either<string, number>> {
        const quest = await getRepository(RadiantQuest).findOneOrFail(questId);
        const user = await getRepository(User).findOneOrFail(userId);

        if (getExplorationLevel(user) < quest.lvlRestriction) {
            return left('Вы не можете начать этот квест');
        }

        return right(quest.baseDuration);
    }
}
