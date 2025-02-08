import { BattleLogic } from "./BattleLogic";
import { BattleManager } from "./BattleManager";

export class BattleDropManager {

    private delayDropMap: { [monsterId: number]: boolean } = {}
    public battleLogic: BattleLogic;

    /***添加1个延迟掉落处理 */
    public pushDelayDropByMonsterId(monsterId: number): void {
        this.delayDropMap[monsterId] = true;
    }

    /***对某个怪物展示1个掉落 */
    public showDelayDropMonster(monsterId: number, items: { itemId: any, num: number }[]): void {
        if (this.delayDropMap[monsterId]) {
            delete this.delayDropMap[monsterId];
            let monsters = BattleManager.ins().mainScene.getEmenys()
            for (let i = 0; i < monsters.length; i++) {
                if (monsters[i].attr.getConfigId() == monsterId) {
                    BattleManager.ins().createSuperDrop(items, monsters[i].pos)
                }
            }
        }
    }
}