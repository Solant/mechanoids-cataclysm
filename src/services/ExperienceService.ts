import { inRange } from 'lodash';
import { User } from '../models/User';
import { logger } from '../logger';

export interface RatingValue {
    value: number,
    current: number,
    next: number,
    percentage: number,
}

function getRating(value: number): RatingValue {
    const ranges: Map<number, [number, number]> = new Map();
    ranges.set(1, [0, 96]);
    ranges.set(2, [96, 215]);
    ranges.set(3, [215, 421]);
    ranges.set(4, [421, 706]);
    ranges.set(5, [706, 1250]);
    ranges.set(6, [1250, 2053]);
    ranges.set(7, [2053, 3222]);
    ranges.set(8, [3222, 4905]);
    ranges.set(9, [4905, 7305]);
    ranges.set(10, [7305, 10700]);
    ranges.set(11, [10700, 15471]);
    ranges.set(12, [15471, 22138]);

    let result: number = 0;
    let next: number = 0;
    ranges.forEach((v, k) => {
        if (inRange(value, v[0], v[1])) {
            result = k;
            next = v[1];
        }
    });

    if (result === 0) {
        logger.error(`Unable to get rating for exp ${value}`);
    }

    return {
        value: result,
        current: value,
        next,
        percentage: Math.round(value / next * 100),
    };
}

export function getBattleLevel(user: User): RatingValue {
    return getRating(user.battleExp);
}

export function getTradeLevel(user: User): RatingValue {
    return getRating(user.tradeExp);
}

export function getCourierLevel(user: User): RatingValue {
    return getRating(user.courierExp);
}

export function getExplorationLevel(user: User): RatingValue {
    return getRating(user.exp);
}
