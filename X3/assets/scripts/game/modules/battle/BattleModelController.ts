import G from "db://assets/scripts/core/comm/G";
import { IBattleEnterData } from "db://assets/scripts/game/modules/battle/vo/IBattleEnterData";
import { CommonBattleViewOpenArgs } from "db://assets/scripts/game/modules/common/battle/CommonBattleView";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { DailyBossUtils } from "db://assets/scripts/game/modules/dailyBoss/utils/DailyBossUtils";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import { Logger } from "../../../core/log/Logger";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { UIManager } from "../../../core/mvc/UIManager";
import { TableManager } from "../../../core/table/TableManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import { BattleLogicManager } from "../../comm/battle/BattleLogicManager";
import BattleSetting from "../../comm/battle/config/BattleSetting";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { MapManager } from "../../tiledMap/MapManager";
import { UICollectiblesDungeonConfig } from "../collectiblesDungeon/const/UICollectiblesDungeonConfig";
import { BattleResultData } from "../common/view/BattleResultWin";
import { DailyBossUIKeys } from "../dailyBoss/DailyBossUIKeys";
import { UIFactoryConfig } from "../factory/const/UIFactoryConfig";
import { UIFriendConfig } from "../friend/const/UIFriendConfig";
import { UIGuardShipConfig } from "../guardShip/const/UIGuardShipConfig";
import { HangUpUIKeys } from "../hangup/HangUpUIKeys";
import { UILeagueKey } from "../league/const/UILeagueConst";
import { UIMapInstanceKey } from "../mapInstance/const/UIMapInstanceConfig";
import { UIPetDungeonConfig } from "../petDungeon/const/UIPetDungeonConfig";
import { PVPUIKeys } from "../pvp/PVPUIKeys";
import { SeasonUIKeys } from "../season/SeasonUIKeys";
import { UISecretAreaKey } from "../secretArea/const/UISecretAreaConfig";
import { WorldBossUiKey } from "../worldBoss/const/WorldBossConst";
import { WorldBossModel } from "../worldBoss/model/WorldBossModel";
import { BattleModel } from "./model/BattleModel";
import { BattleUIUtils } from "./utils/BattleUIUtils";
import { IBattleResult } from "./vo/IBattleResult";
import { IBattleResultWinData } from "./vo/IBattleResultWinData";
import { IBattleResultVo } from "../common/battle/structs/IBattleResultVo";


export class BattleModelController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_END,
            NotificationKey.BATTLE_CANCEL,
            NotificationKey.START_BATTLE,
            NotificationKey.BATTLE_RESULT_WIN,
            NotificationKey.BATTLE_WATCH_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.BATTLE_END:
                this.onBattleEnd(args);
                break;
            case NotificationKey.BATTLE_CANCEL:
                this.onBattleCancel(args);
                break;
            case NotificationKey.START_BATTLE:
                this.onBattleStart(args as IBattleEnterData);
                break;
            case NotificationKey.BATTLE_RESULT_WIN:
                this.onShowResult(args as IBattleResultWinData)
                break;
            case NotificationKey.BATTLE_WATCH_COMPLETE:
                this.onWatchComplete(args as IBattleResult)
                break;
        }
    }

    constructor () {
        super();
        Logger.game("BattleModelController");
    }

    onInit(): void {
    }

    oneSideAllDead(data: IBattleResult) {
        switch (data.fightType) {
            case FightType.TRUNK_MAP:
                //TODO 复活
                break;
            default:
                BattleModel.ins().sendBattleEnd(data);
                break;
        }
    }

    onBattleEnd(data: IBattleResult) {
        switch (data.fightType) {
            case FightType.TRUNK_MAP:
                //主线地图 没有战斗结束
                break;
            case FightType.FRIEND:
                //好友战斗没有奖励 自己判断结束
                BattleModel.ins().sendBattleEnd(data);
                let resultVo:IBattleResultVo = {isWin:data.battleResult == ServerEnums.BattleResult.ATTACKER, fightType:FightType.FRIEND};
                this.emit(NotificationKey.BATTLE_RESULT, resultVo);
                this.emit(NotificationKey.BATTLE_RESULT_WIN, {
                    fightType: FightType.FRIEND,
                    exData: data,
                    isWin: data.battleResult == ServerEnums.BattleResult.ATTACKER
                } as IBattleResultWinData)
                break;
            default:
                BattleModel.ins().sendBattleEnd(data);
                break;
        }
    }

    onBattleCancel(battleConfigId: number) {
        if (!battleConfigId)
            battleConfigId = GIns.battleMgr.battleConfigId
        BattleModel.ins().sendCancelBattle(battleConfigId);
        // this.emit(NotificationKey.EXIT_BATTLE);
    }

    /**
     * 当战斗开始
     * @param data
     * @private
     */
    private onBattleStart(data: IBattleEnterData) {
        if (data.hideBattle) {
            //隐藏战斗的话不处理以下逻辑
            return
        }
        if (MapManager.ins().curMap.isNeedLoadMapResources) {
            this.emitNow(NotificationKey.LOADING_VIEW_SHOW); //加载中
        }
        else {
            this.emit(NotificationKey.LOADING_VIEW_COMPLETE);
        }
        const battleConfigId = data.battleConfigId;
        BattleLogicManager.ins().setAutoFight(data.fightType, BattleSetting.getIsAutoFightByType(data.fightType));
        switch (data.fightType) {
            case FightType.LEAGUE_WAR: {
                // 打开战斗界面
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.LEAGUE_WAR,
                    battleConfigId,
                ));
                break;
            }
            case FightType.ARENA:

                // 打开战斗界面
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.ARENA,
                    battleConfigId,
                ));
                break;
            case FightType.WORLD_BOSS:
                let cfg = WorldBossModel.ins().getWorldBossCfg(battleConfigId).cfg;
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.WORLD_BOSS,
                    battleConfigId,
                    cfg?.name
                ));
                WorldBossModel.ins().openWorldBossBattleUi(battleConfigId);
                break;
            case FightType.DAILY_BOSS:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.DAILY_BOSS,
                    battleConfigId,
                    DailyBossUtils.getMyBattleTempData()
                ));
                break;
            case FightType.LADDER:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.LADDER,
                    battleConfigId,
                ));
                break;
            case FightType.LEAGUE_BOSS:
                let monsterCfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);
                let monsterCfg = monsterCfgs[0];
                let bossName = monsterCfg.name;
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.LEAGUE_BOSS,
                    battleConfigId,
                    bossName
                ));
                break;
            case FightType.FRIEND:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.FRIEND,
                    battleConfigId,
                ));
                break;
            case FightType.TRUNK_INSTANCE:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.TRUNK_INSTANCE,
                    battleConfigId,
                ));
                break;
            case FightType.SECRET_INSTANCE:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.SECRET_INSTANCE,
                    battleConfigId,
                ));
                G.UIManager.open(UISecretAreaKey.SecretAreaBattleView);
                break
            case FightType.MAP_INSTANCE:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.MAP_INSTANCE,
                    battleConfigId,
                ));
                G.UIManager.open(UIMapInstanceKey.MapInstanceView);
                break
            case FightType.GUARD_SHIP:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.GUARD_SHIP,
                    battleConfigId,
                ));
                G.UIManager.open(UIGuardShipConfig.GuardShipBattleView);
                break
            case FightType.FACTORY:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.FACTORY,
                    battleConfigId,
                ));
                break;
            case FightType.TEAM_INSTANCE:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.TEAM_INSTANCE,
                    battleConfigId,
                ));
                break;
            case FightType.LEAGUE_EXPLORE:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.LEAGUE_EXPLORE,
                    battleConfigId,
                ));
                break;
            case FightType.PET_DUNGEON:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.PET_DUNGEON,
                    battleConfigId,
                ));
                break;
            case FightType.TRIAL:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.TRIAL,
                    battleConfigId,
                ));
                break;
            case FightType.SEASON_SECRET:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.SEASON_SECRET,
                    battleConfigId,
                ));
                G.UIManager.open(SeasonUIKeys.SeasonSecretBattleView);
                break
            case FightType.SEASON_BOSS:
                let ssMonsterCfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);
                let ssMonsterCfg = ssMonsterCfgs[0];
                let SSbossName = ssMonsterCfg.name;
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.SEASON_BOSS,
                    battleConfigId,
                    SSbossName
                ));
                break;
            case FightType.COLLECTIBLES_DUNGEON:
                G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
                    ServerEnums.FightType.COLLECTIBLES_DUNGEON,
                    battleConfigId,
                ));
                break;

        }
    }

    private onWatchComplete(data: IBattleResult): void {
        // if (this.delaySaveResultData) {
        // this.onShowResult(this.delaySaveResultData)
        // }
    }

    /***保存的战斗结果 */
    private delaySaveResultData: IBattleResultWinData
    /***显示结算 */
    private onShowResult(data: IBattleResultWinData): void {
        let logic = BattleLogicManager.ins().getNotCreate(data.fightType)
        if (logic && logic.isWatcher) {
            // //观战者判断是否已经结束战斗，未结束战斗先保存着
            // if (logic.isBattleEnd) {
            //     //已经打完可以直接弹出结算
            // }
            // else {
            //     //未打完先保存战斗结果
            //     this.delaySaveResultData = data;
            //     return
            // }
        }
        // this.delaySaveResultData = null;
        // TODO 先去掉战斗屏蔽 | 之前是用来临时屏蔽还能继续操作的问题, 但导致了新的问题
        G.UIManager.open(UICommonKey.TouchMaskWin)

        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
        let battleLogic = BattleLogicManager.ins().getNotCreate(data.fightType)
        if (battleLogic && battleLogic.isHideBattle) {
            //有隐藏战斗的不处理
            return;
        }
        if (GIns.battleMgr.hasHideBattleResult(data.fightType)) {
            //有隐藏战斗的结算不处理,之后马上移除避免只拦截一次
            GIns.battleMgr.removeHideBattleResult(data.fightType);
            return
        }
        GIns.battleMgr.endFight()
        if (data.isWin) {
            let delay = BattleSetting.getResultWinDelayByType(data.fightType)
            if (delay) {
                GameTimer.ins().once(delay, this, this.onShowResultHandler, [data])
                return
            }
        } else {
            let delay = BattleSetting.getResultFailDelayByType(data.fightType)
            if (delay) {
                GameTimer.ins().once(delay, this, this.onShowResultHandler, [data])
                return
            }
        }
        this.onShowResultHandler(data)
    }

    private onShowResultHandler(data: IBattleResultWinData): void {
        let isWin = data.isWin;
        if (data.fightType) {
            switch (data.fightType) {
                case FightType.LEAGUE_WAR: {
                    UIManager.ins().open(GVGUIKeys.GVGBattleResultView, data.exData);
                    break
                }
                case FightType.LADDER:
                    if (isWin) {
                        UIManager.ins().open(UICommonKey.CommonBattleResultWinView, data.exData);
                    } else {
                        UIManager.ins().open(UICommonKey.CommonBattleResultFailView, data.exData);
                    }
                    break
                case FightType.ARENA:
                    UIManager.ins().open(PVPUIKeys.PVPBattleResultView, data.exData)
                    break
                case FightType.WORLD_BOSS:
                    UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_BEAT_PERSON, data.exData);
                    break
                case FightType.LEAGUE_BOSS:
                    UIManager.ins().open(UILeagueKey.LeagueBossChallengeSuccess, data.exData);
                    break
                case FightType.TRUNK_INSTANCE:
                    if (isWin) {
                        UIManager.ins().open(HangUpUIKeys.HangUpBattleResultWinV2View, data.exData);
                    } else {
                        UIManager.ins().open(HangUpUIKeys.HangUpBattleResultFailV2View, data.exData);
                    }
                    break
                case FightType.DAILY_BOSS:
                    UIManager.ins().open(DailyBossUIKeys.DailyBossBattleResultView, data.exData);
                    break
                case FightType.MAP_INSTANCE:
                    if (isWin) {
                        UIManager.ins().open(UIMapInstanceKey.BattleWinResultWin, data.exData);
                    }
                    break
                case FightType.SECRET_INSTANCE:
                    if (isWin)
                        UIManager.ins().open(UISecretAreaKey.SecretAreaBattleWinWin, data.exData)
                    else
                        UIManager.ins().open(UISecretAreaKey.SecretAreaBattleResultWin, data.exData)
                    break
                case FightType.FRIEND:
                    UIManager.ins().open(UIFriendConfig.FRIEND_BATTLE_RESULT_VIEW, data)
                    break
                case FightType.GUARD_SHIP:
                    if (isWin) {
                        UIManager.ins().open(UICommonKey.CommonBattleResultWinView, data.exData);
                    } else {
                        UIManager.ins().open(UICommonKey.CommonBattleResultFailView, data.exData);
                    }
                    break
                case FightType.FACTORY:
                    if (isWin) {
                        UIManager.ins().open(UIFactoryConfig.FactoryBattleResultWin, data.exData);
                    } else {
                        UIManager.ins().open(UICommonKey.CommonBattleResultFailView, data.exData);
                    }
                    break
                case FightType.TEAM_INSTANCE:
                    let logic = BattleLogicManager.ins().getNotCreate(data.fightType)
                    if (!logic) {
                        return;
                    }
                    if (isWin) {
                        UIManager.ins().open(UICommonKey.CommonBattleResultWinView, data.exData);
                    } else {
                        UIManager.ins().open(UICommonKey.CommonBattleResultFailView, data.exData);
                    }
                    break;
                case FightType.LEAGUE_EXPLORE:
                    if (isWin) {
                        UIManager.ins().open(UICommonKey.CommonBattleResultWinView, data.exData);
                    } else {
                        UIManager.ins().open(UICommonKey.CommonBattleResultFailView, data.exData);
                    }
                    break;
                case FightType.PET_DUNGEON:
                    if (isWin) {
                        UIManager.ins().open(UIPetDungeonConfig.PetDungeonBattleWinView, data.exData);
                    } else {
                        UIManager.ins().open(UIPetDungeonConfig.PetDungeonBattleFailView, data.exData);
                    }
                    break;
                case FightType.SEASON_BOSS:
                    UIManager.ins().open(SeasonUIKeys.SeasonBossResultView, data.exData);
                    break;
                case FightType.SEASON_SECRET:
                    UIManager.ins().open(SeasonUIKeys.SeasonSecretResultView, data.exData);
                    break;
                case FightType.COLLECTIBLES_DUNGEON:
                    if (isWin) {
                        UIManager.ins().open(UICollectiblesDungeonConfig.CollectiblesDungeonBattleWinView, data.exData);
                    } else {
                        UIManager.ins().open(UICollectiblesDungeonConfig.CollectiblesDungeonBattleFailView, data.exData);
                    }
                    break;
                case FightType.TRIAL:
                    UIManager.ins().open(UICommonKey.CommonBattleResultWinView, data.exData);
                    break;
            }
        } else if (!isWin) {
            let str = TableManager.getDataById(table.map.MapConstantConfig, "MAP:INSTANCE_DEFEAT").content;
            let list = [];
            for (let id of str.split(";")) {
                if (id) {
                    list.push(Number(id));
                }
            }
            let resData: BattleResultData = {
                fightType: data.fightType,
                labelTitle: "变强途径",
                jumpList: list,
                closeCllBack: data.closeCllBack.method,
            }
            G.UIManager.open(UICommonKey.BattleResultWin, resData);
        }
    }
}

BattleModelController.ins().doInit();