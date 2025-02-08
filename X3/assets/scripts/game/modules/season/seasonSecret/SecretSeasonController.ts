import G from "../../../../core/comm/G";
import { Logger } from "../../../../core/log/Logger";
import { BaseController } from "../../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../../main/modules/LoginNotificationKey";
import { FightType } from "../../../comm/battle/enum/FightType";
import { WorldController, type IBattleEnterDataProcesser } from "../../../comm/world/WorldController";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import type { ITransfer } from "../../../tiledMap/interface/ITransfer";
import { MapManager } from "../../../tiledMap/MapManager";
import { BackpackManager } from "../../backpack/BackpackManager";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import type { IBattleEnterData } from "../../battle/vo/IBattleEnterData";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { FormationManager } from "../../formation/FormationManager";
import { UISecretAreaKey } from "../../secretArea/const/UISecretAreaConfig";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonModel } from "../SeasonModel";
import { SeasonSecretVo } from "../vo/SeasonSecretVo";
import { SecretSeasonManager } from "./SecretSeasonManager";
 

export class SecretSeasonController extends BaseController implements IBattleEnterDataProcesser {
    private _subActId:number;

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.TEAM_DIE,
            NotificationKey.SECRET_SEASON_AREA_UPDATE_BOSS,
            NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH_PASSED,
            NotificationKey.BATTLE_START_STATE,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.SECRET_AREA_UPDATE_INFO,
            NotificationKey.HERO_UP_COMMON_LV,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.updateRedDotForChallenge()
                break
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                this.updateFormation(args);
                if (args == FightType.SEASON_SECRET) {
                    //保存完阵容直接进入挑战
                    let id = FormationManager.ins().getAutoFightParam(FightType.SEASON_SECRET)
                    if (id > 0) {
                        const cfg = SeasonConfigManager.getSecretConfig(id)
                        SeasonModel.ins().sendChallengeSecret({subActivityId:cfg.subActivityId, floor:cfg.floor})
                        FormationManager.ins().deleteAutoFightParam(FightType.SEASON_SECRET)
                    }
                }
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.enterSecretArea(args);
                break;
            case NotificationKey.TEAM_DIE:
                this.teamDie(args);
                break;
            case NotificationKey.SECRET_SEASON_AREA_UPDATE_BOSS:
                this.updateBoss();
                break;
            case NotificationKey.BATTLE_START_STATE:
                this.updateFightTime(args)
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                if (!args) return
                let changeItemIdToCountMap: Map<number, number> = args;
                if (changeItemIdToCountMap.has(GIns.secretAreaMgr.dailyCostItem.itemId) ||
                    changeItemIdToCountMap.has(GIns.secretAreaMgr.extraCostItem.itemId)
                ) {
                    this.updateRedDotForChallenge()
                }
                break
            case NotificationKey.SECRET_AREA_UPDATE_INFO:
                this.updateRedDotForNewFloor()
                break
            case NotificationKey.HERO_UP_COMMON_LV:
                GIns.secretAreaMgr.checkShowUnlockAni({ commonLV: true });
                break
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            //后期解锁条件可能配置多样 所以这里加上所有解锁事件
            this.updateRedDotForNewFloor();
        }
    }

    onInit(): void {
        WorldController.ins().setEnterBattleProc(FightType.SEASON_SECRET, this)
    }

    public set actId(id:number){
        this._subActId = id;
    }

    private updateFormation(type: number) {
        if (type == FightType.SEASON_SECRET) {
            if (FormationManager.ins().getFormationVoByType(type)) {
                SecretSeasonManager.ins().formation = FormationManager.ins().getFormationVoByType(type)
            }
            this.emit(NotificationKey.SECRET_AREA_UPDATE_INFO);
        }
    }

    private enterSecretArea(args: any) {
        // if (SecretAreaManager.ins().isEnter) {
        //     G.UIManager.open(UISecretAreaKey.SecretAreaBattleView);
        // }

        if (SecretSeasonManager.ins()._break) {
            this.emit(NotificationKey.SECRET_AREA_UPDATE_INFO);
            SecretSeasonManager.ins()._break = false;
        }
    }

    /** 团灭 */
    private teamDie(fightType: ServerEnums.FightType) {
        if (!SecretSeasonManager.ins().isEnter) return;
        if (fightType != ServerEnums.FightType.SEASON_SECRET) return;
    }

    /** 刷新boss */
    private updateBoss() {
        G.UIManager.open(UISecretAreaKey.SecretAreaBossWin, ServerEnums.FightType.SEASON_SECRET);
        let cfg = TableManager.getDataById(table.battle.BattleConfig, GIns.battleMgr.battleConfigId);
        //策划说第一个是boss，直接拿就行
        SecretSeasonManager.ins().bossId = cfg.monsterResourceIds[0];
    }

    private updateFightTime(data: any) {
        if (SecretSeasonManager.ins().isEnter) {
            // SecretAreaManager.ins().fightStartTime = TimeManager.serverNow;
        }
    }

    /**开始挑战*/
    public startChallenge(id: number) {
        //挑戰
    }

    protected updateRedDotForChallenge(): void {
        // let { dailyCostItem, extraCostItem } = GIns.secretAreaMgr;
        // GIns.redDotMgr.setRedDot(RedDotKeys.Secret_challenge_times, dailyCostItem.isCanPay(false) || extraCostItem.isCanPay(false));
    }

    protected updateRedDotForNewFloor(): void {
        // GIns.redDotMgr.clearAll(RedDotKeys.Secret_new_floor)
        // let level = GIns.secretAreaMgr.level + 1;
        // let cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, level);
        // //目前只是共鸣等级 等改了之后再修改解锁条件判断
        // let isUnlock = cfg && cfg.level <= GIns.formationMgr.getCommonLevel()
        // GIns.redDotMgr.setRedDot(RedDotKeys.Secret_new_floor, isUnlock, [level])
    }

    public battleEnterDataProcess(data: Readonly<IBattleEnterData>, out_transferData: ITransfer): void {
        let modulePlayInfo = data.modulePlayInfo as Vo.seasonactivity.SeasonSecretBattleInfo;
        let mapIds = this.getMapIds(modulePlayInfo);
        out_transferData.mapIds = mapIds;
        out_transferData.useStartObj = true
    }

    public getMapIds(modulePlayInfo: Vo.seasonactivity.SeasonSecretBattleInfo, floor?: number) {
        if (floor === undefined) {
            floor = modulePlayInfo.currentFloor;
        }
        let roomIds = (modulePlayInfo.floorMap[String(floor)] as Vo.seasonactivity.SeasonSecretFloorVo).roomIds;
        let mapIds = roomIds.map(rId => {
            let rCfg = G.TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretRoomConfig, rId);
            if (rCfg) {
                return rCfg.mapId;
            } else {
                Logger.error(`table.secretinstance.SecretInstanceRoomConfig 表找不到id：${rId}`);
            }
        }).filter(v => { return v; });
        return mapIds;
    }
}
SecretSeasonController.ins().doInit();
