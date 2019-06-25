import Telegraf from 'telegraf';
const session = require('telegraf/session');
const introduction = require('./stages/introduction/index');

const bot = new Telegraf('');
bot.use(session());
bot.use(introduction.middleware());
// @ts-ignore
bot.on('message', ctx => ctx.scene.enter('intro1'));
bot.startPolling();
