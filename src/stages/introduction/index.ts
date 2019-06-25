import BaseScene from 'telegraf/scenes/base';
import Stage from 'telegraf/stage';
import { inRange } from 'lodash';

const intro1 = new BaseScene('intro1');

intro1
    .enter(ctx => ctx.reply('привет, введи имя'))
    .on('message', ctx => {
        if (ctx.message && ctx.message.text) {
            const { text } = ctx.message;
            if (inRange(text.length, 5, 25)) {
                return ctx.reply('оке');
            }
        }
        return ctx.reply('неправильное имя');
    });

export default new Stage([intro1]);
