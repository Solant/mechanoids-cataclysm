import { ContextMessageUpdate } from 'telegraf';

declare module 'telegraf' {
    interface ContextMessageUpdate {
        i18n: {
            // setter
            locale(languageCode: string): void,
            // getter
            locale(): string,
            getTemplate(languageCode: string, resourceKey?: string): any,
            t(resourceKey: string, context?: any): string,
        },
    }
}
