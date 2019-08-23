import BaseScene from 'telegraf/scenes/base';
import Stage from 'telegraf/stage';
import { inRange } from 'lodash';
import { oc } from 'ts-optchain';
import { getRepository } from 'typeorm';
import { User } from '../../models/User';
import { Location } from '../../models/Location';

export enum IntroductionScenes {
    Intro1 = 'intro1',
}

const intro1 = new BaseScene(IntroductionScenes.Intro1);

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
        newUser.userId = ctx.from!.id;
        newUser.chatId = ctx.chat!.id;
        newUser.location = (await getRepository(Location).findOne(1))!;
        await getRepository(User).save(newUser);
        await ctx.reply(ctx.i18n.t('story', { userName: newUser.name }));
        return ctx.scene.enter('location');
    });

const scene2 = new BaseScene('location');
scene2.enter(async ctx => {
    const user = await getRepository(User)
        .findOne({ chatId: ctx.chat!.id }, { relations: ['location'] });
    const locationName = user!.location.name;

    return ctx.reply(ctx.i18n.t('buildingGreeting', { locationName }));
});

export default new Stage([intro1, scene2]);
