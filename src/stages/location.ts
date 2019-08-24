import BaseScene from 'telegraf/scenes/base';
import { getRepository } from 'typeorm';

import { User } from '../models/User';
import { Location } from '../models/Location';
import { logger } from '../logger';

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

enter.on('text', ctx => ctx.scene.reenter());

enter.on('callback_query', async (ctx, next) => {
    if (ctx.callbackQuery!.data === 'travel') {
        const locations = await getRepository(Location).find();
        const user = await getRepository(User)
            .findOneOrFail({ where: { chatId: ctx.chat!.id }, relations: ['location'] });

        const availableLocations = locations.filter(l => user.location.id !== l.id);
        const buttons = availableLocations.map(l => ([{ text: l.name, callback_data: `travel-to:${l.id}` }]));
        await ctx.reply('Список доступных локаций:', {
            reply_markup: {
                inline_keyboard: buttons,
            },
        });
        await ctx.answerCbQuery();
    }
    if (next) next();
});

enter.on('callback_query', async (ctx, next) => {
    if (ctx.callbackQuery!.data!.startsWith('travel-to')) {
        const id = ctx.callbackQuery!.data!.split(':')[1];
        const location = await getRepository(Location).findOne(id);
        if (!location) {
            logger.error(`Unable to find location with id=${id}`);
            await ctx.reply('Невозможно отправиться в эту локацию');
        } else {
            setTimeout(() => {
                ctx.reply('Прибыли');
                getRepository(User).update({ chatId: ctx.chat!.id }, { location });
            }, 10000);
            await ctx.reply('Вылетаем, прибытие через 10 секунд');
        }
        await ctx.answerCbQuery();
    }
    if (next) next();
});


export default [enter];
