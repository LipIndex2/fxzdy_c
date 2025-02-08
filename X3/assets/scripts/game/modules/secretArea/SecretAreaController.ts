import G from "../../../core/comm/G";
import { Logger } from "../../../core/log/Logger";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { StringUtils } from "../../../core/utils/StringUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { FightType } from "../../comm/battle/enum/FightType";
import { WorldController, type IBattleEnterDataProcesser } from "../../comm/world/WorldController";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import type { ITransfer } from "../../tiledMap/interface/ITransfer";
import { BackpackManager } from "../backpack/BackpackManager";
import type { IBattleEnterData } from "../battle/vo/IBattleEnterData";
import { UICommonKey } from "../common/const/UICommonConfig";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { ConditionUtils } from "../condition/ConditionUtils";
import { FormationManager } from "../formation/FormationManager";
import { UISecretAreaKey } from "./const/UISecretAreaConfig";
import { SecretAreaManager } from "./SecretAreaManager";
import { SecretAreaModule } from "./SecretAreaModule";

declare global {
    namespace XJ {
        namespace SecretArea {
            interface IUnlockAniParam {
                initData?: true; //初始化

                newFloor?: true //打赢战斗后新的层级

                commonLV?: true //共鸣等级更新
            }
        }
    }
}

export class SecretAreaController extends BaseController implements IBattleEnterDataProcesser {

    protected _isInitPlayer: boolean = false;
    protected _isOpen: boolean = false;
    protected _isOpenAd: boolean = false;
    protected _openAdCondition: any[][] = null;

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.TEAM_DIE,
            NotificationKey.SECRET_AREA_UPDATE_BOSS,
            NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH_PASSED,
            NotificationKey.BATTLE_START_STATE,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.SECRET_AREA_UPDATE_INFO,
            NotificationKey.HERO_UP_COMMON_LV,
            NotificationKey.SECRET_AREA_SWEEP,
            NotificationKey.SYSTEM_NEW_DAY,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this._isInitPlayer = true;
                this.updateRedDotForChallenge();
                this.checkOpenAd();
                this.checkLoadInfo();
                break
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                this.updateFormation(args);
                if (args == FightType.SECRET_INSTANCE) {
                    //保存完阵容直接进入挑战
                    let id = FormationManager.ins().getAutoFightParam(FightType.SECRET_INSTANCE)
                    if (id > 0) {
                        this.startChallenge(id)
                        FormationManager.ins().deleteAutoFightParam(FightType.SECRET_INSTANCE)
                    }
                }
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.enterSecretArea(args);
                break;
            case NotificationKey.TEAM_DIE:
                this.teamDie(args);
                break;
            case NotificationKey.SECRET_AREA_UPDATE_BOSS:
                this.updateBoss();
                break;
            case NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH_PASSED:
                this.rebirth(args);
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
                this.updateRedDotForNewFloor();
                this.updateRedDotForAd();
                break
            case NotificationKey.HERO_UP_COMMON_LV:
                // let param: XJ.IHero.IHeroUpCommonLVParam = args;
                GIns.secretAreaMgr.checkShowUnlockAni({ commonLV: true });
                break
            case NotificationKey.SECRET_AREA_SWEEP:
                this.updateRedDotForAd();
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                //跨天刷新
                this.checkLoadInfo();
                break;
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            //后期解锁条件可能配置多样 所以这里加上所有解锁事件
            this.updateRedDotForNewFloor();
            if (this._isInitPlayer && this._isOpenAd == false) {
                this.checkOpenAd();
            }
            if (this._isInitPlayer && this._isOpen == false) {
                this.checkLoadInfo();
            }
        }
    }

    onInit(): void {
        WorldController.ins().setEnterBattleProc(FightType.SECRET_INSTANCE, this)
    }

    protected checkLoadInfo(): void {
        this._isOpen = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.SECRET_INSTANCE);
        if (this._isOpen) {
            SecretAreaModule.ins().sendLoadSecretInstanceInfo();
        }
    }

    protected checkOpenAd(): void {
        if (this._openAdCondition == null) {
            let conditionCfg = G.TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, 'SECRET_INSTANCE:SWEEP_UNLOCK_ADVERT');
            if (conditionCfg && conditionCfg.content) {
                this._openAdCondition = StringUtils.strToArr(conditionCfg.content);
            } else {
                this._openAdCondition = [];
            }
        }
        this._isOpenAd = GIns.conditionMgr.checkCondition(this._openAdCondition);
        if (this._isOpenAd) {
            this.updateRedDotForAd();
        }
    }

    private updateFormation(type: number) {
        if (type == FightType.SECRET_INSTANCE) {
            if (FormationManager.ins().getFormationVoByType(type)) {
                SecretAreaManager.ins().formation = FormationManager.ins().getFormationVoByType(type)
            }
            this.emit(NotificationKey.SECRET_AREA_UPDATE_INFO);
        }
    }

    private enterSecretArea(args: any) {
        // if (SecretAreaManager.ins().isEnter) {
        //     G.UIManager.open(UISecretAreaKey.SecretAreaBattleView);
        // }

        if (SecretAreaManager.ins()._break) {
            this.emit(NotificationKey.SECRET_AREA_UPDATE_INFO);
            SecretAreaManager.ins()._break = false;
        }
    }

    /** 团灭 */
    private teamDie(fightType: ServerEnums.FightType) {
        if (!SecretAreaManager.ins().isEnter) return;
        if (fightType != ServerEnums.FightType.SECRET_INSTANCE) return;

        // G.UIManager.open(UISecretAreaKey.SecretAreaTipsWin, { type: 1 });
        //直接退出
        this.emit(NotificationKey.SECRET_AREA_EXIT_CLICK);
    }

    //参数true为免费复活
    private rebirth(isFree: boolean) {
        if (!SecretAreaManager.ins().isEnter) return;
        GIns.battleMgr.stopFightAi();
        if (isFree) {
            let data: NCommon.ITransferAnimToPointWin_param = {
                transferData: {
                    mapIds: GIns.mapMgr.getMultiMapIDS(),
                    useStartObj: true,
                }
            };
            G.UIManager.open(UICommonKey.TransferAnimToPointWin, data);
            this.emit(NotificationKey.TEAM_REBIRTH);
            G.GameTimer.once(5000, this, () => {
                G.FacadeManager.emit(NotificationKey.BATTLE_START);
            })
        } else {
            SecretAreaManager.ins().payRebirth = SecretAreaManager.ins().payRebirth + 1;
            this.emit(NotificationKey.TEAM_REBIRTH);
            G.FacadeManager.emit(NotificationKey.BATTLE_START);
        }

        G.UIManager.close(UISecretAreaKey.SecretAreaTipsWin);
    }

    /** 刷新boss */
    private updateBoss() {
        G.UIManager.open(UISecretAreaKey.SecretAreaBossWin);
        let cfg = TableManager.getDataById(table.battle.BattleConfig, GIns.battleMgr.battleConfigId);
        //策划说第一个是boss，直接拿就行
        SecretAreaManager.ins().bossId = cfg.monsterResourceIds[0];
    }

    private updateFightTime(data: any) {
        if (SecretAreaManager.ins().isEnter) {
            // SecretAreaManager.ins().fightStartTime = TimeManager.serverNow;
        }
    }

    /**开始挑战*/
    public startChallenge(id: number) {
        let secretAreaMgr = GIns.secretAreaMgr
        if(secretAreaMgr.isPassFloor(id)){
            //通关了，需要消耗门票，未通关的话就不需要消耗门票
            if(!GIns.backpackMgr.isCanPayItem(secretAreaMgr.dailyCostItem) && !GIns.backpackMgr.isCanPayItem(secretAreaMgr.extraCostItem)) {
                GIns.floatingTextMgr.showTips("道具不足！")
                return;
            }
        }
        
        let cfg = G.TableManager.getDataById(table.secretinstance.SecretInstanceConfig, id);
        if (cfg?.level > FormationManager.ins().getCommonLevel()) {
            GIns.floatingTextMgr.showTips(`共鸣等级达到${cfg.level}级后可进入此难度`)
            return;
        }
        SecretAreaModule.ins().sendChallenge(id);
    }

    protected updateRedDotForChallenge(): void {
        // let { dailyCostItem, extraCostItem } = GIns.secretAreaMgr;
        // GIns.redDotMgr.setRedDot(RedDotKeys.Secret_challenge_times, dailyCostItem.isCanPay(false) || extraCostItem.isCanPay(false));
    }

    protected updateRedDotForNewFloor(): void {
        // GIns.redDotMgr.clearAll(RedDotKeys.Secret_new_floor)
        // let level = GIns.secretAreaMgr.level + 1;
        // let cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, level);
        // //目前只是共鸣等级 等改了之后再修改解锁条件判断
        // let isUnlock = cfg && cfg.level <= GIns.formationMgr.getCommonLevel()
        // GIns.redDotMgr.setRedDot(RedDotKeys.Secret_new_floor, isUnlock, [level])
    }

    protected updateRedDotForAd(): void {
        let remainTimes: number = GIns.adModel.getRemainAdTimes(GIns.secretAreaMgr.todaySweepAdvertTimes, ServerEnums.AdvertType.SECRET_INSTANCE);
        if (this._isOpenAd && remainTimes > 0) {
            GIns.redDotMgr.setRedDot(RedDotKeys.Secret_sweepAd, GIns.secretAreaMgr.hasCanSweepLevel());
        } else {
            GIns.redDotMgr.setRedDot(RedDotKeys.Secret_sweepAd, false);
        }
    }

    public battleEnterDataProcess(data: Readonly<IBattleEnterData>, out_transferData: ITransfer): void {
        let modulePlayInfo = data.modulePlayInfo as Vo.secretinstance.SecretInstanceBattleInfo;
        let mapIds = this.getMapIds(modulePlayInfo);
        out_transferData.mapIds = mapIds;
        out_transferData.useStartObj = true
    }

    public getMapIds(modulePlayInfo: Vo.secretinstance.SecretInstanceBattleInfo, floor?: number) {
        if (floor === undefined) {
            floor = modulePlayInfo.currentFloor;
        }
        let roomIds = (modulePlayInfo.floorMap[String(floor)] as Vo.secretinstance.SecretInstanceFloorVo).roomIds;
        let mapIds = roomIds.map(rId => {
            let rCfg = G.TableManager.getDataById(table.secretinstance.SecretInstanceRoomConfig, rId);
            if (rCfg) {
                return rCfg.mapId;
            } else {
                Logger.error(`table.secretinstance.SecretInstanceRoomConfig 表找不到id：${rId}`);
            }
        }).filter(v => { return v; });
        return mapIds;
    }
}
SecretAreaController.ins().doInit();
