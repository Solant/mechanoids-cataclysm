import BaseScene from 'telegraf/scenes/base';
import { getRepository } from 'typeorm';
import dayjs from 'dayjs';

import { ContextMessageUpdate, Markup, Middleware } from 'telegraf';
import { User } from '../models/User';
import { Location } from '../models/Location';
import { logger } from '../logger';
import { DeferredMessage } from '../models/DeferredMessage';

export enum LocationScenes {
    Intro = 'location:1',
    Map = 'location:map',
    Travel = 'location:travel',
}

enum CallbackActions {
    EnterBuilding = 'enter_building',
}

const enter = new BaseScene(LocationScenes.Intro);
enter.enter(async ctx => {
    const user = await getRepository(User)
        .findOne(ctx.session.userId, { relations: ['location'] });
    const locationName = user!.location.name;

    return ctx.reply(ctx.i18n.t('buildingGreeting', { locationName }),
        {
            reply_markup: {
                inline_keyboard: [[{ text: 'Вылететь', callback_data: 'travel' }]],
            },
        });
});

enter.on('callback_query', async (ctx, next) => {
    if (ctx.callbackQuery!.data === 'travel') {
        // @ts-ignore
        return ctx.scene.enter(LocationScenes.Map).then(() => ctx.answerCbQuery());
    }
    // @ts-ignore
    return next();
});

const map = new BaseScene(LocationScenes.Map);
map.enter(async ctx => {
    const locations = await getRepository(Location).find();
    const user = await getRepository(User)
        .findOneOrFail({ where: { chatId: ctx.chat!.id }, relations: ['location'] });

    const availableLocations = locations.filter(l => user.location.id !== l.id);
    const buttons = availableLocations.map(l => ([{ text: l.name, callback_data: `travel-to:${l.id}` }]));
    return ctx.reply('Список доступных локаций:', {
        reply_markup: {
            inline_keyboard: buttons,
        },
    });
});

map.on('callback_query', async (ctx, next) => {
    if (ctx.callbackQuery!.data!.startsWith('travel-to')) {
        const id = ctx.callbackQuery!.data!.split(':')[1];
        const location = await getRepository(Location).findOne(id);
        ctx.answerCbQuery();

        if (!location) {
            logger.error(`Unable to find location with id=${id}`);
            return ctx.reply('Невозможно отправиться в эту локацию');
        }

        const message = new DeferredMessage();
        message.chatId = ctx.chat!.id;
        message.date = dayjs().add(10, 'second').toDate();
        message.text = 'Вы прибыли на место';
        message.extra = JSON.stringify({
            reply_markup: Markup.inlineKeyboard([
                Markup.callbackButton('Продолжить', CallbackActions.EnterBuilding),
            ]),
        });

        return Promise.all([
            getRepository(DeferredMessage).save(message),
            ctx.scene.enter(LocationScenes.Travel),
        ]);
    }
    // @ts-ignore
    return next();
});

const travel = new BaseScene(LocationScenes.Travel);
travel
    .enter(ctx => ctx.reply('Вылетаем, прибытие через 10 секунд'))
    .on('callback_query', replyCb(CallbackActions.EnterBuilding, ctx => ctx.scene.enter(LocationScenes.Intro)));


interface MiddlewareCallback {
    (ctx: ContextMessageUpdate, data: string): Promise<any> | any
}
function replyCb(action: string, cb: MiddlewareCallback): Middleware<ContextMessageUpdate> {
    return function handler(ctx, next) {
        if (ctx.callbackQuery!.data!.startsWith(action)) {
            return cb(ctx, ctx.callbackQuery!.data!.split(':')[1] || '')
                .then(() => ctx.answerCbQuery());
        }
        // @ts-ignore
        return next();
    };
}

export default [enter, map, travel];
