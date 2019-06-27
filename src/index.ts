import Telegraf from 'telegraf';
import { config } from 'dotenv';
import { resolve } from 'path';
import TelegrafI18n from 'telegraf-i18n';
import introduction from './stages/introduction/index';

config({ path: resolve(__dirname, '../.env') });

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false,
    directory: resolve(__dirname, '../locales'),
});

const session = require('telegraf/session');

const bot = new Telegraf(process.env.TOKEN || '');
bot.use(session());
bot.use(i18n.middleware());
bot.use(introduction.middleware());
// @ts-ignore
bot.on('message', ctx => ctx.scene.enter('intro1'));
bot.startPolling();
