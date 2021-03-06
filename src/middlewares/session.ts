import { ContextMessageUpdate, Middleware } from 'telegraf';
import { getRepository } from 'typeorm';
import { performance } from 'perf_hooks';
import { Session } from '../models/Session';

type SessionData = any;

export function createSession(): Middleware<ContextMessageUpdate> {
    const sessionRepo = getRepository(Session);
    return function session(ctx, next) {
        const userId = ctx.from!.id;
        const chatId = ctx.chat!.id;

        const sessionData: SessionData = {};
        let isNewSession = true;

        const t1 = performance.now();
        return sessionRepo
            .findOne({
                where: { userId, chatId },
            })
            .then(s => {
                if (s) {
                    isNewSession = false;
                    Object.assign(sessionData, JSON.parse(s.data));
                }
                // @ts-ignore
                ctx.session = sessionData;
                // @ts-ignore
                // eslint-disable-next-line no-underscore-dangle
                ctx.__sessionQueryTime = performance.now() - t1;
            })
            .then(() => (next ? next() : undefined))
            .then(() => {
                // upsert
                if (isNewSession) {
                    sessionRepo.save({ chatId, userId, data: JSON.stringify(sessionData) });
                } else {
                    sessionRepo.update({ chatId, userId }, { data: JSON.stringify(sessionData) });
                }
            });
    };
}
