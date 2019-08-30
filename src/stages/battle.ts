import BaseScene from 'telegraf/scenes/base';
import { Telegram, Extra, Markup } from 'telegraf';
import { uniqueId } from 'lodash';
import {
    ActionItem,
    ChangeableStat, ItemEffect, PC, Player,
} from './CharStats';

const battle = new BaseScene('battle:1');

interface BattleSession {
    id: string,
    duration: number,
    playerOne: Player,
    playerTwo: Player,
    actionQueue:
    {
        effect: ItemEffect,
        source: Player,
        target: Player,
        item: ActionItem,
    }[],
}

const tickRate = 300;
const battleSessions: BattleSession[] = [];

function getStatMarkup<T>(stat: ChangeableStat<T>): string {
    return `<b>${stat.current}</b>/<b>${stat.max}</b>`;
}

function handleTick(tg: Telegram): void {
    function getText(self: Player, enemy: Player, session: BattleSession): string {
        let result = `Время: ${(session.duration / 1000).toFixed(2)} секунд\n`;
        result += 'Ваш глайдер:\n';
        result += `HP: ${getStatMarkup(self.hp)}\n`;
        result += `SP: ${getStatMarkup(self.shield)}\n`;
        result += `EN: ${getStatMarkup(self.energy)}\n`;
        result += '\n';

        result += 'Враг:\n';
        result += `HP: ${getStatMarkup(enemy.hp)}\n`;
        result += `SP: ${getStatMarkup(enemy.shield)}\n`;
        result += `EN: ${getStatMarkup(enemy.energy)}\n`;
        result += '\n';

        return result;
    }

    function getMarkup(self: PC, session: BattleSession) {
        const buttons = self.items
            .map(i => Markup.callbackButton(i.name, `act:${session.id}:${i.name}:${self.chatId}`, false));

        // @ts-ignore
        return Extra
            .HTML(true)
            .markup((m: Markup) => m.inlineKeyboard(buttons, {}));
    }

    function updatePlayerOnDemand(self: Player, enemy: Player, session: BattleSession): void {
        if (self.type !== 'pc') {
            return;
        }

        tg.editMessageText(
            self.chatId,
            self.messageId,
            undefined,
            getText(self, enemy, session),
            getMarkup(self, session),
        );
    }

    for (let i = 0; i < battleSessions.length; i++) {
        const session = battleSessions[i];
        // flushing queue
        while (session.actionQueue.length > 0) {
            const a = session.actionQueue.shift();
            if (a) {
                a.effect(a.source, a.target, a.item);
            }
        }
        session.duration += tickRate;
        updatePlayerOnDemand(session.playerOne, session.playerTwo, session);
        updatePlayerOnDemand(session.playerTwo, session.playerOne, session);
    }
}

battle.enter(async ctx => {
    const msg = await ctx.reply('Hehe', { reply_markup: { inline_keyboard: [[{ text: 'asd', callback_data: 'q' }]] } });
    battleSessions.push({
        id: uniqueId(),
        duration: 0,
        actionQueue: [],
        playerOne: {
            type: 'pc',
            chatId: ctx.chat!.id,
            messageId: msg.message_id,
            hp: { max: 100, current: 100 },
            shield: { max: 100, current: 100 },
            energy: { max: 100, current: 100 },
            items: [{
                cooldown: 3000,
                lastUsage: new Date(),
                name: 'Пуф',
                effect: (source, target, item) => {
                    source.energy.current -= 10;
                    target.shield.current -= 20;
                    item.lastUsage = new Date();
                },
            }],
        },
        playerTwo: {
            type: 'npc',
            hp: { max: 100, current: 100 },
            shield: { max: 100, current: 100 },
            energy: { max: 100, current: 100 },
            aiHandler: () => console.log('thonk'),
            items: [{
                cooldown: 3000,
                lastUsage: new Date(),
                name: 'Пуф',
                effect: (source, target, item) => {
                    source.energy.current -= 10;
                    target.shield.current -= 20;
                    item.lastUsage = new Date();
                },
            }],
        },
    });

    setInterval(() => handleTick(ctx.telegram), tickRate);
});

battle.on('callback_query', ctx => {
    const [unused, sessionId, name, chatId] = ctx.callbackQuery!.data!.split(':');

    const session = battleSessions.find(s => s.id === sessionId)!;

    let source: Player;
    let target: Player;
    if (session.playerOne.type === 'pc' && session.playerOne.chatId.toString() === chatId) {
        source = session.playerOne;
        target = session.playerTwo;
    } else {
        source = session.playerTwo;
        target = session.playerOne;
    }
    const item: ActionItem = source.items.find(i => i.name === name)!;

    session.actionQueue.push({
        source,
        target,
        effect: item.effect,
        item,
    });

    return ctx.answerCbQuery('');
});

export default [battle];
