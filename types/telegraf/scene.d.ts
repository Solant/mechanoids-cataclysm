declare module 'telegraf/scenes/base' {
    import { Composer, ContextMessageUpdate, Middleware, Telegraf } from 'telegraf';

    export default class BaseSceneClass<TContext extends ContextMessageUpdate> extends Composer<TContext> {
        constructor(id: string, options?: any);
        enter(fns: Middleware<TContext>): this;
        leave(fns: Middleware<TContext>): this;
    }
}
