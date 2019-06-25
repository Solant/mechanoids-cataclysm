declare module 'telegraf/scenes/base' {
    import { Composer, ContextMessageUpdate, Middleware } from 'telegraf';

    export default class BaseScene<TContext extends ContextMessageUpdate> extends Composer<TContext> {
        constructor(id: string, options?: any);
        enter(fns: Middleware<TContext>): this;
        leave(fns: Middleware<TContext>): this;
    }
}
