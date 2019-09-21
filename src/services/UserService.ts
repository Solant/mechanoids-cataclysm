import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { Rewardable } from '../models/experience';
import { RadiantQuest } from '../models/RadiantQuest';
import { right } from 'fp-ts/lib/Either';
import { getCourierLevel, getTradeLevel } from './ExperienceService';

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

    static async currentStatus(userId: string | number) {
        const user = await getRepository(User).findOneOrFail(userId);

        const courierRating = getCourierLevel(user);
        const tradeRating = getTradeLevel(user);

        let result = '';
        result += `💎 <b>${user.money}</b> кристаллов\n`;
        result += `<b>${user.exp}</b> очков опыта\n`;
        result += `📦 <b>${courierRating.value}</b> Курьерский рейтинг (${courierRating.current} / ${courierRating.next}, ${courierRating.percentage}%)\n`;
        result += `📈 <b>${tradeRating.value}</b> Торговый рейтинг (${tradeRating.current} / ${tradeRating.next}, ${tradeRating.percentage}%)\n`;
        result += `<b>${user.battleExp}</b> очков боевого рейтинга\n`;

        return result;
    }
}
