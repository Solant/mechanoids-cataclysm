import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { Rewardable } from '../models/experience';

export class UserService {
    static async applyRewards(userId: string | number, reward: Rewardable) {
        const user = await getRepository(User).findOneOrFail(userId);
        await getRepository(User).update(userId, {
            exp: user.exp + reward.exp,
            courierExp: user.courierExp + reward.courierExp,
            battleExp: user.battleExp + reward.battleExp,
            tradeExp: user.tradeExp + reward.tradeExp,
            money: user.money + reward.money,
        });
    }

    static async currentLocationStatus(userId: string | number) {
        const user = await getRepository(User).findOneOrFail(userId, { relations: ['location'] });

        const result = `Текущая локация: <b>${user.location.name}</b>\n`;
        return result;
    }
}
