import BaseScene from 'telegraf/scenes/base';
import { getRepository } from 'typeorm';
import dayjs from 'dayjs';

import { ContextMessageUpdate, Markup, Middleware } from 'telegraf';
import { User } from '../models/User';
import { Location } from '../models/Location';
import { logger } from '../logger';
import { DeferredMessage } from '../models/DeferredMessage';
import { getExplorationLevel } from '../services/ExperienceService';
import { RadiantQuest } from '../models/RadiantQuest';

export enum LocationScenes {
    Intro = 'location:1',
    Map = 'location:map',
    Travel = 'location:travel',
    Quests = 'location:quests',
}

enum CallbackActions {
    EnterBuilding = 'enter_building',
    BackToEntrance = 'enter_entrance',
    EnterQuestsScreen = 'enter_quests',
    QuestPage = 'quest-page',
}

function cbData(action: string, data: string | number) {
    return `${action}:${data}`;
}

const enter = new BaseScene(LocationScenes.Intro);
enter.enter(async ctx => {
    const user = await getRepository(User)
        .findOne(ctx.session.userId, { relations: ['location'] });
    const locationName = user!.location.name;

    return ctx.reply(ctx.i18n.t('buildingGreeting', { locationName }),
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Вылететь', callback_data: 'travel' }],
                    [{ text: 'Задания', callback_data: CallbackActions.EnterQuestsScreen }],
                ],
            },
        });
})
    .on('callback_query', replyCb(CallbackActions.EnterQuestsScreen, ctx => ctx.scene.enter(LocationScenes.Quests)));

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
    buttons.push([{ text: '< Назад', callback_data: CallbackActions.BackToEntrance }]);
    return ctx.reply('Список доступных локаций:', {
        reply_markup: {
            inline_keyboard: buttons,
        },
    });
})
    .on('callback_query', replyCb(CallbackActions.BackToEntrance, ctx => ctx.scene.enter(LocationScenes.Intro)));

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


async function getAvailableQuests(userId: number, page: number) {
    const user = await getRepository(User).findOneOrFail(userId);
    const level = getExplorationLevel(user);

    const pageSize = 4;
    const [availableQuests, size] = await getRepository(RadiantQuest)
        .createQueryBuilder()
        .where('"lvlRestriction" <= :level')
        .skip(page * pageSize)
        .take(pageSize)
        .addOrderBy('name')
        .setParameter('level', level)
        .getManyAndCount();

    const questButtons = availableQuests.map(q => [Markup.callbackButton(q.name, q.code)]);
    const navigationButtons = [];
    if (size > pageSize) {
        if (page > 0) {
            navigationButtons.push(Markup.callbackButton('<', cbData(CallbackActions.QuestPage, page - 1)));
        }
        if (page * (pageSize + 2) < size) {
            navigationButtons.push(Markup.callbackButton('>', cbData(CallbackActions.QuestPage, page + 1)));
        }
    }
    const back = Markup.callbackButton('Назад', '<==');

    return Markup.inlineKeyboard([...questButtons, navigationButtons, [back]]);
}

const quests = new BaseScene(LocationScenes.Quests);
quests
    .enter(async ctx => {
        return ctx.reply('Список доступных заданий:', {
            reply_markup: await getAvailableQuests(ctx.session.userId, 0),
        });
    })
    .on('callback_query', replyCb(CallbackActions.QuestPage, (ctx, data) => {
        return getAvailableQuests(ctx.session.userId, Number.parseInt(data, 10))
            .then(res => ctx.editMessageReplyMarkup(res));
    }));

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

export default [enter, map, travel, quests];
