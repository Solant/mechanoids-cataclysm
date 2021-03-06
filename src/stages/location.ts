import BaseScene from 'telegraf/scenes/base';
import { getRepository } from 'typeorm';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';
import { isLeft } from 'fp-ts/lib/Either';

import { Markup } from 'telegraf';
import { User } from '../models/User';
import { Location } from '../models/Location';
import { logger } from '../logger';
import { DeferredMessage } from '../models/DeferredMessage';
import { getExplorationLevel } from '../services/ExperienceService';
import { RadiantQuest } from '../models/RadiantQuest';
import { replyCb, createCb } from './callbacks';
import { RadiantQuestsService } from '../services/RadiantQuestsService';
import { DeferredMessagesService } from '../services/DeferredMessagesService';
import { UserService } from '../services/UserService';

dayjs.extend(relativeTime);
dayjs.locale('ru');

export enum LocationScenes {
    Busy = 'location:busy',
    Intro = 'location:1',
    Map = 'location:map',
    Travel = 'location:travel',
    Quests = 'location:quests',
    ActiveQuest = 'location:active-quest',
    StatusScreen = 'location:status',
}

enum CallbackActions {
    StartQuest = 'start_quest',
    Travel = 'travel',
    EnterBuilding = 'enter_building',
    BackToEntrance = 'enter_entrance',
    EnterQuestsScreen = 'enter_quests',
    EnterStatusScreen = 'enter_status',
    QuestPage = 'quest-page',
    QuestInfo = 'quest-info',
    CompleteRadiantQuestAndEnter = 'crqae',
}

const enter = new BaseScene(LocationScenes.Intro);
enter.enter(async ctx => {
    return ctx.replyWithHTML(await UserService.currentLocationStatus(ctx.session.userId), {
        reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton('Вылететь', CallbackActions.Travel)],
            [Markup.callbackButton('Задания', CallbackActions.EnterQuestsScreen)],
            [Markup.callbackButton('Статус', CallbackActions.EnterStatusScreen)],
        ]),
    });
})
    .on('callback_query', replyCb(CallbackActions.EnterQuestsScreen, ctx => ctx.scene.enter(LocationScenes.Quests)))
    .on('callback_query', replyCb(CallbackActions.EnterStatusScreen, ctx => ctx.scene.enter(LocationScenes.StatusScreen)));

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
    const level = getExplorationLevel(user).value;

    const pageSize = 4;
    const [availableQuests, size] = await getRepository(RadiantQuest)
        .createQueryBuilder()
        .where('"lvlRestriction" <= :level')
        .skip(page * pageSize)
        .take(pageSize)
        .addOrderBy('name')
        .setParameter('level', level)
        .getManyAndCount();

    const questButtons = availableQuests
        .map(q => [Markup.callbackButton(q.name, createCb(CallbackActions.QuestInfo, q.id))]);

    const navigationButtons = [];
    if (size > pageSize) {
        if (page > 0) {
            navigationButtons.push(Markup.callbackButton('<', createCb(CallbackActions.QuestPage, page - 1)));
        }
        if (page * (pageSize + 2) < size) {
            navigationButtons.push(Markup.callbackButton('>', createCb(CallbackActions.QuestPage, page + 1)));
        }
    }
    const back = Markup.callbackButton('Назад', CallbackActions.EnterBuilding);

    return Markup.inlineKeyboard([...questButtons, navigationButtons, [back]]);
}

const quests = new BaseScene(LocationScenes.Quests);
quests
    .enter(async ctx => ctx.reply('Список доступных заданий:', {
        reply_markup: await getAvailableQuests(ctx.session.userId, 0),
    }))
    .on('callback_query', replyCb(CallbackActions.QuestPage, (ctx, data) => {
        const q = getAvailableQuests(ctx.session.userId, Number.parseInt(data, 10));
        return q.then(res => ctx.editMessageText('Список заданий:', { reply_markup: res }));
    }))
    .on('callback_query', replyCb(CallbackActions.QuestInfo, async (ctx, data) => {
        const { response, id } = await RadiantQuestsService.getQuestInfo(data);

        return ctx.editMessageText(response, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Принять', callback_data: createCb(CallbackActions.StartQuest, id) }],
                    [{ text: 'Назад', callback_data: createCb(CallbackActions.QuestPage, 0) }],
                ],
            },
        });
    }))
    .on('callback_query', replyCb(CallbackActions.EnterBuilding, ctx => ctx.scene.enter(LocationScenes.Intro)))
    .on('callback_query', replyCb(CallbackActions.StartQuest, async (ctx, questId) => {
        const result = await RadiantQuestsService.canStartQuest(questId, ctx.session.userId);

        if (isLeft(result)) {
            throw result.left;
        }

        DeferredMessagesService.sendLater(ctx.chat!.id, result.right, 'Задание выполнено', JSON.stringify({
            reply_markup: Markup.inlineKeyboard([
                Markup.callbackButton('Продолжить', createCb(CallbackActions.CompleteRadiantQuestAndEnter, questId)),
            ]),
        }));

        await ctx.reply(`Задание будет выполнено ${dayjs().add(result.right, 'millisecond').fromNow()}`);
        return ctx.scene.enter(LocationScenes.Busy, undefined, true);
    }));

const busy = new BaseScene(LocationScenes.Busy);
busy.enter(({ reply }) => reply('Вы заняты выполнением действия'));
busy.on('callback_query', replyCb(CallbackActions.CompleteRadiantQuestAndEnter, async (ctx, questId) => {
    const res = await RadiantQuestsService.completeQuest(questId);
    if (isLeft(res)) {
        throw res.left;
    }

    const { reward, response } = res.right;
    await UserService.applyRewards(ctx.session.userId, reward);
    await ctx.replyWithHTML(response);
    await ctx.deleteMessage();
    return ctx.scene.enter(LocationScenes.Intro);
}));

const statusScreen = new BaseScene(LocationScenes.StatusScreen);
statusScreen
    .enter(async ctx => {
        return ctx.replyWithHTML(await UserService.currentStatus(ctx.session.userId), {
            reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton('Назад', CallbackActions.EnterBuilding)],
            ]),
        });
    })
    .on('callback_query', replyCb(CallbackActions.EnterBuilding, ctx => ctx.scene.enter(LocationScenes.Intro)));

const travel = new BaseScene(LocationScenes.Travel);
travel
    .enter(ctx => ctx.reply('Вылетаем, прибытие через 10 секунд'))
    .on('callback_query', replyCb(CallbackActions.EnterBuilding, ctx => ctx.scene.enter(LocationScenes.Intro)));


export default [enter, map, travel, quests, busy, statusScreen];
