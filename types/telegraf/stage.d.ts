declare module 'telegraf/stage' {
    import { Composer, ContextMessageUpdate, Middleware } from 'telegraf';
    import BaseScene from "telegraf/scenes/base";

    export default class Stage<TContext extends ContextMessageUpdate> extends Composer<TContext> {
        constructor(stages: [BaseScene<TContext>], options?: any);
        register(...scenes: [BaseScene<TContext>]): this;
        middleware(): Middleware<TContext>;
    }

}
