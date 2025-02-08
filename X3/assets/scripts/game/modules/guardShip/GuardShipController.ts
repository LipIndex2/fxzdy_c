import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { BattleConfigManager } from "../../comm/battle/config/BattleConfigManager";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { FormationMainViewOpenArgs, UIFormationKey } from "../formation/const/UIFormationConfig";


export class GuardShipController extends BaseController {

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.GUARDSHIP_UPDATE_INFO,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.loadGuardShipInfo()
                break
            case NotificationKey.SYSTEM_NEW_DAY:
                this.onNewDay()
                break;
            case NotificationKey.GUARDSHIP_UPDATE_INFO:
                GIns.guardShipModel.sendLoadRankList({ page: 1 })
                break

        }
    }

    /**天数变更*/
    protected onNewDay(): void {
        GIns.guardShipModel.updateEndTime();
        this.loadGuardShipInfo()
    }

    protected loadGuardShipInfo(): void {
        let isOpen: boolean = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.GUARD_SHIP)
        if (isOpen) {
            GIns.guardShipModel.sendLoadGuardShipInfo();
        }
    }

    /**挑战*/
    public challenge(instanceId: number): void {
        let buyChallengeTimes: boolean = false
        if (GIns.guardShipModel.freeTimes <= 0) {
            buyChallengeTimes = true
            let item = GIns.guardShipModel.challengeCosts?.length > 0 ? GIns.guardShipModel.challengeCosts[0] : null
            if (item && !GIns.backpackMgr.isCanPayItem(item, true)) {
                GIns.floatingTextMgr.showTips("道具不足！")
                return;
            }
        }

        const vo = GIns.formationMgr.getFormationVoByType(FightType.GUARD_SHIP)
        if (vo?.isEmptyFormation()) {
            // 阵容空
            console.info("需要先布阵");
            this.setUpFormation();
            return;
        }
        let isNeedFull = BattleConfigManager.getBattleSettingConfig(FightType.GUARD_SHIP)?.forceFullPosition
        if (isNeedFull && vo?.isFullFormation() == false) {
            //阵容未满
            console.info("需要先布阵");
            this.setUpFormation();
            return;
        }
        GIns.guardShipModel.sendChallenge({ instanceId: instanceId, buyChallengeTimes: buyChallengeTimes })
    }

    /**扫荡*/
    public sweep(instanceId: number): void {
        if (GIns.guardShipModel.freeTimes <= 0) {
            let item = GIns.guardShipModel.challengeCosts?.length > 0 ? GIns.guardShipModel.challengeCosts[0] : null
            if (item && !GIns.backpackMgr.isCanPayItem(item, true)) {
                GIns.floatingTextMgr.showTips("道具不足！")
                return;
            }
            GIns.guardShipModel.sendSweep({ instanceId: instanceId, buySweepTimes: true })
            return
        }
        GIns.guardShipModel.sendSweep({ instanceId: instanceId, buySweepTimes: false })
    }

    /**设置阵容*/
    public setUpFormation(): void {
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
            FightType.GUARD_SHIP,
        ))
    }

    /**使用道具*/
    public useDropItem(itemId: number): void {
        let cfg = G.TableManager.getDataById(table.guardship.GuardShipUseItemConfig, itemId)
        if (cfg == null) {
            //使用道具不存在
            return
        }
        let dropCfg = G.TableManager.getDataById(table.battle.ClientDropConfig, itemId)
        GIns.battleDebugMgr.debugAddBuffByShip(itemId)
        if (dropCfg) {
            GIns.floatingTextMgr.showTips(`使用${dropCfg.name}成功`)
        }
        GIns.guardShipModel.deleteProp(itemId)
    }

    onInit(): void {

    }
}

GuardShipController.ins().doInit();