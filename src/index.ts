import 'reflect-metadata';
import Telegraf from 'telegraf';
import { config } from 'dotenv';
import { resolve } from 'path';
import TelegrafI18n from 'telegraf-i18n';
import { createConnection } from 'typeorm';
import introduction from './stages/introduction/index';
import { User } from './models/User';

import { logger } from './logger';

const session = require('telegraf/session');

config({ path: resolve(__dirname, '../.env') });

(async () => {
    logger.info('Connecting to database');
    await createConnection({
        type: 'postgres',
        host: process.env.DB_HOST || '',
        port: Number.parseInt(process.env.DB_PORT || '0', 10),
        username: process.env.DB_USERNAME || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        entities: [
            User,
        ],
        synchronize: true,
        logging: false,
    });
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
    // @ts-ignore
    bot.on('message', ctx => ctx.scene.enter('intro1'));
    bot.startPolling();
    logger.info('Bot started');
})();
