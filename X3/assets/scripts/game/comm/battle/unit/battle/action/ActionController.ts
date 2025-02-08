import { ActorState } from "../../../enum/BattleEnum";
import { ActorUnitNode } from "../../../node/ActorUnitNode";
import { ActorUnit } from "../../ActorUnit";

/***动作管理器 */
export class ActionController {
    protected unit: ActorUnit
    protected spineNode: ActorUnitNode;
    protected actionList: {}[] = [];
    public constructor (unit: ActorUnit, spineNode: ActorUnitNode) {
        this.unit = unit;
        this.spineNode = spineNode;
    }

    /***添加1个动作 */
    public addAction(state: ActorState, anim?: string, timeScale?: number, directionParm: number = 0, loopType: number = 0): void {
        this.actionList.push()
    }
}