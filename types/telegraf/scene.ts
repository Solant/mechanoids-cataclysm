declare module 'telegraf/scenes/base' {
    import { Composer, ContextMessageUpdate, Middleware, HearsTriggers } from 'telegraf';

    interface BaseScene<TContext extends ContextMessageUpdate> extends Composer<TContext> {
        enter(fns: Middleware<TContext>): this;
        leave(fns: Middleware<TContext>): this;
    }
    interface BaseSceneConstructor {
        new <TContext extends ContextMessageUpdate>(id: string, options?: any): BaseScene<TContext>;
    }

    export const BaseScene: BaseSceneConstructor;
}
