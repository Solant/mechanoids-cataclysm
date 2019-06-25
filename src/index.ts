import Telegraf from 'telegraf';
import introduction from './stages/introduction/index';
const session = require('telegraf/session');

const bot = new Telegraf('');
bot.use(session());
bot.use(introduction.middleware());
// @ts-ignore
bot.on('message', ctx => ctx.scene.enter('intro1'));
bot.startPolling();
