import { getRepository } from 'typeorm';
import dayjs from 'dayjs';
import { DeferredMessage } from '../models/DeferredMessage';

export class DeferredMessagesService {
    static async sendLater(chatId: number, delay: number, text: string, extra: string) {
        return getRepository(DeferredMessage)
            .save({
                chatId,
                text,
                date: dayjs().add(delay, 'millisecond').toDate(),
                extra,
            });
    }
}
