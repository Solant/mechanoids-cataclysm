import { ContextMessageUpdate, Middleware } from 'telegraf';

interface MiddlewareCallback {
    (ctx: ContextMessageUpdate, data: string): Promise<any> | any
}

export function createCb(action: string, data: string | number) {
    return `${action}:${data}`;
}

export function replyCb(action: string, cb: MiddlewareCallback): Middleware<ContextMessageUpdate> {
    return function handler(ctx, next) {
        if (ctx.callbackQuery!.data!.startsWith(action)) {
            return cb(ctx, ctx.callbackQuery!.data!.split(':')[1] || '')
                .then(() => ctx.answerCbQuery());
        }
        // @ts-ignore
        return next();
    };
}
