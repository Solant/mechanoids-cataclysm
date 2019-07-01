import { ContextMessageUpdate, Middleware } from 'telegraf';

declare module 'telegraf' {
    interface ContextMessageUpdate {
        scene: {
            reset(): void,
            // eslint-disable-next-line max-len
            enter<TContext extends ContextMessageUpdate>(sceneId: string, initialState?: any, silent?: boolean): Middleware<TContext>,
            reenter<TContext extends ContextMessageUpdate>(): Middleware<TContext>,
            leave<TContext extends ContextMessageUpdate>(): Middleware<TContext>,
        },
    }
}
