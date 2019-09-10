import { inRange } from 'lodash';
import { User } from '../models/User';

export function getExplorationLevel(user: User): number {
    const experience = user.exp;
    const ranges: Map<number, [number, number]> = new Map();
    ranges.set(1, [0, 100]);
    ranges.set(2, [100, 300]);
    ranges.set(3, [300, 600]);

    let result: number = 0;
    ranges.forEach((v, k) => {
        if (inRange(experience, v[0], v[1])) {
            result = k;
        }
    });
    // TODO: add logger error

    return result;
}
