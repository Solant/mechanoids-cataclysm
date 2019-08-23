import BaseScene from 'telegraf/scenes/base';
import { getRepository } from 'typeorm';

import { User } from '../models/User';

export enum LocationScenes {
    Intro = 'intro',
}

const enter = new BaseScene(LocationScenes.Intro);
enter.enter(async ctx => {
    const user = await getRepository(User)
        .findOne({ chatId: ctx.chat!.id }, { relations: ['location'] });
    const locationName = user!.location.name;

    return ctx.reply(ctx.i18n.t('buildingGreeting', { locationName }),
        {
            reply_markup: {
                inline_keyboard: [[{ text: 'Вылететь', callback_data: 'travel' }]],
            },
        });
});

enter.on('callback_query', async ctx => {
    await ctx.reply('asd');
    await ctx.answerCbQuery('');
});



export default [enter];
