export interface ISummonData {
    isSummon: boolean
    time?: number
    attr?: { [key: number]: number }
    /***所属召唤者的UID */
    byUid: number;
    /***附身的召唤物，主要用于束缚BUFF */
    possess?: string;
    /***召唤特效 */
    effect?: { modelIds: { up: number[], low: number[] }, animPosType: number }
    /***延迟多少秒才能行动，过程中无敌，且透明度渐隐出场 */
    delay?: number
    /***额外数据 */
    exData?: any
    /**是否分裂怪，分裂怪的话，本地会隐身+无敌，等子召唤物死亡后死亡 */
    isSplitMonster?: boolean
}