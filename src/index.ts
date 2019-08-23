import 'reflect-metadata';
import Telegraf from 'telegraf';
import { config } from 'dotenv';
import { resolve } from 'path';
import TelegrafI18n from 'telegraf-i18n';
import { createConnection } from 'typeorm';

import introduction, { IntroductionScenes } from './stages/introduction/index';

import { logger } from './logger';

const session = require('telegraf/session');

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
    bot.use(session());
    bot.use(i18n.middleware());
    bot.use(introduction.middleware());
    bot.on('message', ctx => ctx.scene.enter(IntroductionScenes.Intro1));
    bot.startPolling();
    logger.info('Bot started');
})();
