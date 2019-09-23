import 'reflect-metadata';
import Telegraf from 'telegraf';
import { config } from 'dotenv';
import { resolve } from 'path';
import TelegrafI18n from 'telegraf-i18n';
import { createConnection, getRepository } from 'typeorm';

import dayjs from 'dayjs';
import stages from './stages';
import { logger } from './logger';

import { createSession } from './middlewares/session';
import { createPerformance } from './middlewares/performance';
import { DeferredMessage } from './models/DeferredMessage';
import { User } from './models/User';

const Bottleneck = require('bottleneck');

config({ path: resolve(__dirname, '../.env') });

(async () => {
    logger.info('Connecting to database');
    await createConnection();
    logger.info('Database connected');

    logger.info('Starting bot');
    const i18n = new TelegrafI18n({
        defaultLanguage: 'ru',
        allowMissing: false,
        directory: resolve(__dirname, '../locales'),
    });

    const bot = new Telegraf(process.env.TOKEN || '');
    bot.use(createSession());
    bot.use(createPerformance());
    bot.use(i18n.middleware());
    bot.use(stages.middleware());

    const limiter = new Bottleneck({
        minTime: 1000 * 60 / 25,
        maxConcurrent: 1,
    });
    const wrapped = limiter.wrap((chatId: number, msg: string) => {
        bot.telegram.sendMessage(chatId, msg);
    });

    bot.command('/broadcast', ctx => {
        if (ctx.from!.id.toString() === process.env.ADMIN_ID) {
            getRepository(User)
                .find()
                .then(res => {
                    const msg = ctx.message!.text!.replace('/broadcast ', '');
                    res.forEach(user => {
                        wrapped(user.chatId, msg);
                    });
                });
        }
    });
    bot.on('message', ctx => {
        // @ts-ignore
        if (ctx.session.__scenes.current) {
            return ctx.scene.reenter();
        }
        return ctx.scene.enter('introduction:1');
    });
    bot.catch((err: any) => logger.error(err));
    bot.on('callback_query', ctx => {
        return ctx.answerCbQuery('Невозможно выполнить данное действие');
    });
    bot.startPolling();
    logger.info('Bot started');

    setInterval(() => {
        function sendMessageAndDelete(msg: DeferredMessage) {
            return Promise.all([
                bot.telegram.sendMessage(msg.chatId, msg.text, JSON.parse(msg.extra)),
                getRepository(DeferredMessage).delete(msg.id),
            ]);
        }

        getRepository(DeferredMessage)
            .createQueryBuilder()
            .where('date < :now')
            .setParameter('now', dayjs().toDate())
            .getMany()
            .then(msgs => msgs.forEach(sendMessageAndDelete));
    }, 10000);
})();
