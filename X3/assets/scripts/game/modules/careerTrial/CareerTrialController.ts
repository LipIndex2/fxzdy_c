import { BaseController } from "../../../core/mvc/controller/BaseController";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { TableManager } from "../../../core/table/TableManager";
import { WorldUnitTeam } from "../../comm/battle/enum/BattleEnum";
import { FightType } from "../../comm/battle/enum/FightType";
import { BattleUnit } from "../../comm/battle/unit/battle/BattleUnit";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";

/**
 * 挂机
 */
export class CareerTrialController extends BaseController {

    listenNotifications(): string[] {
        return [NotificationKey.BATTLE_PLAY_UNIT_DIE,
        NotificationKey.BATTLE_START
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.BATTLE_PLAY_UNIT_DIE:
                this.onBattlePlayUnitDead(args)
                break
            case NotificationKey.BATTLE_START:
                this.onBattleStart()
                break
        }
    }

    onInit(): void {
    }

    private onBattlePlayUnitDead(data: BattleUnit): void {
        if (data.battleLogic.fightType == FightType.TRIAL) {
            if (data.teamId == WorldUnitTeam.Enemy && !data.summon) {
                this.dieNum--
                if (this.dieNum == 0) {
                    FacadeManager.ins().emit(NotificationKey.BATTLE_CHECK_END, true);
                }
            }
        }
    }

    private dieNum = 0;
    private onBattleStart(): void {
        if (GIns.battleMgr.battleLogic.fightType == FightType.TRIAL) {
            let enterData = GIns.battleModel.getEnterData(FightType.TRIAL)
            if (enterData) {
                let trialId = +enterData.battleEnterData;
                let cfg = TableManager.getDataById(table.player.TrialConfig, trialId)
                if (cfg) {
                    this.dieNum = cfg.dieNum;
                }
            }
        }
    }
}

CareerTrialController.ins().doInit();


