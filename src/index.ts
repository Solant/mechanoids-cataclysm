import Telegraf from 'telegraf';
import { config } from 'dotenv';
import { resolve } from 'path';
import introduction from './stages/introduction/index';

config({ path: resolve(__dirname, '../.env') });

const session = require('telegraf/session');

const bot = new Telegraf(process.env.TOKEN || '');
bot.use(session());
bot.use(introduction.middleware());
// @ts-ignore
bot.on('message', ctx => ctx.scene.enter('intro1'));
bot.startPolling();
