export interface ChangeableStat<T> {
    current: T,
    max: T,
}

export interface BaseStats {
    hp: ChangeableStat<number>,
    energy: ChangeableStat<number>,
    shield: ChangeableStat<number>,
    items: ActionItem[],
}

export interface PC extends BaseStats {
    type: 'pc',
    chatId: number,
    messageId: number,
}

export interface NPC extends BaseStats {
    type: 'npc',
    aiHandler: Function,
}

export type Player = PC | NPC;

export interface ActionItem {
    cooldown: number,
    lastUsage: Date,
    effect: ItemEffect,
    name: string,
}

export interface ItemEffect {
    (source: BaseStats, target: BaseStats, item: ActionItem): any;
}
