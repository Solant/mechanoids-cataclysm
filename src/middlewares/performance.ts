import { Middleware, ContextMessageUpdate } from 'telegraf';
import { performance } from 'perf_hooks';
import { logger } from '../logger';

export function createPerformance(): Middleware<ContextMessageUpdate> {
    return function middleware(ctx, next) {
        const start = performance.now();
        // @ts-ignore
        // eslint-disable-next-line no-underscore-dangle
        const sceneName: string = ctx.session.__scenes ? ctx.session.__scenes.current : 'unknown';

        // @ts-ignore
        return next()
            .then(() => {
                // @ts-ignore
                // eslint-disable-next-line no-underscore-dangle
                const duration = performance.now() - start + ctx.__sessionQueryTime;
                // @ts-ignore
                const updateType = `${ctx.updateType}:[${ctx.updateSubTypes.toString()}]`;
                // @ts-ignore
                // eslint-disable-next-line no-underscore-dangle,max-len
                logger.info(`Scene "${sceneName}" "${updateType}" took ${duration.toFixed(2)}ms (${ctx.__sessionQueryTime.toFixed(2)}ms session retrieve)`);
            });
    };
}
