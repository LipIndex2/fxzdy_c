import { fsm } from "../../../../core/fsm/FSM";
import GIns from "../../../GIns";
import { GuardShipFSMEvent, GuardShipFSMState } from "../const/GuardShipFSMEnum";

export class GuardShipIdleState extends fsm.State {
    public name: string = GuardShipFSMState.Idle;

    protected _runningTime:number = 0
    /**boss来袭动画 和网络异步 这里需要等一段时间才进入结束阶段*/
    protected _waitEndTime:number = 8000

    public onEnter(): void {
        let battleVo = GIns.guardShipModel.battleVo
        if (battleVo.hasRound()) {
            //存在波次进入波次阶段
            this.transLater(GuardShipFSMEvent.GotoRound)
        }
        this._runningTime = 0
    }

    public onUpdate(dt: number): void {
        this._runningTime += dt
        let battleVo = GIns.guardShipModel.battleVo
        if (battleVo.hasRound() == false && this._runningTime >= this._waitEndTime) {
            //战斗流程结束 延时2秒进入防止怪物数据未返回 而导致的判断怪物死完
            this.trans(GuardShipFSMEvent.GotoEnd)
        }
    }
}