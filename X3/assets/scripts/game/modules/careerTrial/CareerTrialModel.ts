import G from "../../../core/comm/G";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../core/table/TableManager";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { CommonBattleResultViewOpenArgs } from "../battle/args/CommonBattleResultViewOpenArgs";
import { IBattleEnterData } from "../battle/vo/IBattleEnterData";
import { IBattleResultWinData } from "../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../common/battle/structs/IBattleResultVo";

export class CareerTrialModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 11;

    public static getModule(): number {
        return this.ins().MODULE;
    }

    constructor () {
        super();
        this.regist();
    }

    /**
    * 注册所有从服务端收到的回调。
    */
    private regist(): void {
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 7, this.onEnterBattle);
        this.registerMsg(moduleId, -3, this.onBattleResult);
    }

    public initData(): void {
    }

    /***进入战斗 */
    public sendEnterBattle(id: number): void {
        let cfg = TableManager.getDataById(table.player.TrialConfig, id)
        if (cfg) {
            if (GIns.battleModel.setEnterData({ fightType: FightType.TRIAL } as IBattleEnterData, id)) {
                let c2s = {} as Vo.player.ChallengeTrialC2S;
                c2s.trialId = id;
                this.send(this.MODULE, 7, c2s, { c2s: c2s });
            }
        }
    }

    private onEnterBattle(): void {

    }

    /***战斗结算 */
    private onBattleResult(vo: Vo.player.TrialChallengeVo): void {
        let resultVo:IBattleResultVo = {isWin:vo.win, fightType:FightType.TRIAL};
        G.FacadeManager.emit(NotificationKey.BATTLE_RESULT, resultVo);
        this.emit(NotificationKey.BATTLE_RESULT_WIN, {
            fightType: FightType.TRIAL,
            exData: CommonBattleResultViewOpenArgs.create(
                vo.win,
                false,
                NoOwnerItem.createByServerReward(vo.rewardResults),
                null,
                FightType.TRIAL,
                0)
        } as IBattleResultWinData);
    }
}