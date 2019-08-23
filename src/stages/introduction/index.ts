import BaseScene from 'telegraf/scenes/base';
import Stage from 'telegraf/stage';
import { inRange } from 'lodash';
import { oc } from 'ts-optchain';
import { getRepository } from 'typeorm';
import { User } from '../../models/User';

enum Scenes {
    Intro1 = 'intro1',
}

const intro1 = new BaseScene(Scenes.Intro1);

intro1
    .enter(ctx => ctx.reply(ctx.i18n.t('greeting')))
    .on('message', async ctx => {
        const name = oc(ctx).message.text('');

        if (name.length === 0) {
            return ctx.reply(ctx.i18n.t('getName'));
        }

        if (!inRange(name.length, 5, 25)) {
            return ctx.reply(ctx.i18n.t('getNameLength'));
        }

        const otherUser = await getRepository(User).findOne({ where: { name } });
        if (otherUser !== undefined) {
            return ctx.reply(ctx.i18n.t('getNameExists'));
        }

        const newUser = new User();
        newUser.name = name;
        await getRepository(User).save(newUser);
        await ctx.scene.leave();
        return ctx.reply(ctx.i18n.t('story', { userName: newUser.name }));
    });


export default new Stage([intro1]);
