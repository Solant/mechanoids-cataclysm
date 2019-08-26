import 'reflect-metadata';
import Telegraf from 'telegraf';
import { config } from 'dotenv';
import { resolve } from 'path';
import TelegrafI18n from 'telegraf-i18n';
import { createConnection } from 'typeorm';

import stages from './stages';
import { logger } from './logger';
import { IntroductionScenes } from './stages/introduction';

import { createSession } from './middlewares/session';

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
    bot.use(i18n.middleware());
    bot.use(stages.middleware());
    bot.on('message', ctx => ctx.scene.enter(IntroductionScenes.Intro1));
    bot.startPolling();
    logger.info('Bot started');
})();
