import G from "../../../../core/comm/G";
import { fsm } from "../../../../core/fsm/FSM";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { CommonBattleBossCommingArgs } from "../../common/battle/CommonBattleBossComming";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { GuardShipFSMState } from "../const/GuardShipFSMEnum";

export class GuardShipCreateMonsterState extends fsm.State {
    public name: string = GuardShipFSMState.CreateMonster;
    protected _nextRoundId:number = 0
    public onEnter(): void {
        //进入下一波
        let battleVo = GIns.guardShipModel.battleVo
        GIns.battleModel.sendRoundChange(battleVo.nextRoundCfg.id, battleVo.battleConfigId)
        this._nextRoundId = battleVo.nextRoundCfg.id
        battleVo.waitCreateMonster = true
    }

    public onExit(): void {
        let battleVo = GIns.guardShipModel.battleVo
        if (battleVo.curRoundCfg?.id == this._nextRoundId) {
            //代表进入下一波次成功
            let roundType = ServerEnums.GuardShipRoundType[battleVo.curRoundCfg.roundType]
            if (roundType == ServerEnums.GuardShipRoundType.NORMAL) {
                //创建普通怪物 直接请求
                this.loadMonsters()
            } else {
                //创建boss需要提示boss到来
                // G.UIManager.open(UICommonKey.CommonBattleBossComming, CommonBattleBossCommingArgs.create(() => {
                    this.loadMonsters()
                // }))
            }
        }
    }

    protected loadMonsters():void {
        let battleVo = GIns.guardShipModel.battleVo
        GIns.battleModel.sendLoadBattleMonster(battleVo.curRoundCfg.monsterResourceIds, battleVo.battleConfigId)
    }
}