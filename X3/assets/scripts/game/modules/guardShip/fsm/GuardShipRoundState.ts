import { fsm } from "../../../../core/fsm/FSM";
import GIns from "../../../GIns";
import { GuardShipFSMEvent, GuardShipFSMState } from "../const/GuardShipFSMEnum";

export class GuardShipRoundState extends fsm.State {
    public name: string = GuardShipFSMState.Round;

    protected _isBossRound: boolean = false
    protected _roundIdx: number = -1

    public onEnter(): void {
        let battleVo = GIns.guardShipModel.battleVo
        this._isBossRound = battleVo?.isBossRound()
        if (this._roundIdx != battleVo.curRoundIdx) {
            this._roundIdx = battleVo.curRoundIdx
            battleVo.nextRoundDelay = 0
        }
        if (this._isBossRound == false && battleVo.nextRoundCfg?.delayTime <= 0) {
            //立即执行
            this.transLater(GuardShipFSMEvent.GotoCreateMonster)
        }
    }

    public onUpdate(dt: number): void {
        if (this._isBossRound == false) {
            let battleVo = GIns.guardShipModel.battleVo
            battleVo.nextRoundDelay += dt / 1000
            if (battleVo.isNextRoundCommingTime()) {
                //波次时间到 开始创建怪物
                this.trans(GuardShipFSMEvent.GotoCreateMonster)
            }
        }
    }
}