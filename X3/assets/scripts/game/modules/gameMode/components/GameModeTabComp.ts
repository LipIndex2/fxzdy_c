import { Color } from "cc";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { DailyBossUIKeys } from "db://assets/scripts/game/modules/dailyBoss/DailyBossUIKeys";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { DailyBossUtils } from "db://assets/scripts/game/modules/dailyBoss/utils/DailyBossUtils";
import { EnumGameModeTabCompType } from "db://assets/scripts/game/modules/gameMode/enums/EnumGameModeTabCompType";
import { GodSequenceUIKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceUIKeys";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { PVPUIKeys } from "db://assets/scripts/game/modules/pvp/PVPUIKeys";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { RaceLogoComp } from "db://assets/scripts/game/modules/race/components/RaceLogoComp";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import GIns from "../../../GIns";
import { GodSequenceController } from "../../godsequence/GodSequenceController";
import { UIGuardShipConfig } from "../../guardShip/const/UIGuardShipConfig";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIPetDungeonConfig } from "../../petDungeon/const/UIPetDungeonConfig";
import { SecretAreaManager } from "../../secretArea/SecretAreaManager";
import { UISecretAreaKey } from "../../secretArea/const/UISecretAreaConfig";
import { TeamChallengeUIKeys } from "../../teamChallenge/TeamChallengeUIKeys";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { UICollectiblesDungeonConfig } from "../../collectiblesDungeon/const/UICollectiblesDungeonConfig";


/**
 * 游戏模式 tab
 */
export class GameModeTabComp extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gameMode";

    static viewName: string = "GameModeTabComp";


    // endregion
    private _systemType: ServerEnums.SystemType;
    private _isCanPlay: boolean = true;
    // 玩法
    private _config: table.gameMode.GameModeMainConfig;
    // 模块
    private _moduleConfig: table.verify.PlayerSystemOpenConfig | null;

    // 种族
    private _raceIdConfigs: string[] = [];
    //当前计时结束时间
    protected _endTime: number;

    private get view(): ui.gameMode.components.GameModeTabComp {
        return this as any;
    }

    constructor() {
        super();
    }

    public onInit() {
        this.view.godItemList.itemRenderer = this.iRForGodItem.bind(this);
        this.view.onClick(this.onClickPanel, this)
    }

    onPreDispose() {
        GameTimer.ins().clearAll(this);
    }

    reset(config: table.gameMode.GameModeMainConfig) {
        if (!config) {
            return;
        }
        this._config = config;

        GameTimer.ins().clearAll(this);

        let moduleId = config.moduleId;

        this._isCanPlay = true;
        let moduleConfig = G.TableManager.getDataById(table.verify.PlayerSystemOpenConfig, moduleId);
        this._moduleConfig = null;
        if (moduleConfig) {
            this._moduleConfig = moduleConfig;
            const enumModule = ServerEnums.SystemType[moduleId];
            const canSeeFlag = ModuleOpenManager.ins().isCanOpenModule(enumModule, false);
            this.view.getController("canSeeFlag").selectedIndex = (canSeeFlag ? 1 : 0);

            this._isCanPlay = canSeeFlag;
            if (!canSeeFlag) {
                this.view.labelLockTitle.text = ModuleOpenManager.ins().getModuleLockTips(enumModule);
            }

        } else {
            this.view.getController("canSeeFlag").selectedIndex = 1;

            console.error(`游戏玩法 moduleId=${moduleId} 在 PlayerSystemOpenConfig 模块开启表, 找不到模块配置`);
        }

        this.view.labelTitle.text = this._config.title;
        this.view.labelDesc.text = this._config.desc;
        this.view.bg.icon = config.bgImagePath;
        this.view.labelTitle.strokeColor = new Color(this._config.titleStroke);

        this.updateByModule(config.moduleId)

    }

    private updateByModule(moduleId: string) {
        const type = ServerEnums.SystemType[moduleId];
        this._systemType = type;


        this.refreshRedDot(type);

        this.view.getController("type").selectedIndex = EnumGameModeTabCompType.DEFAULT;
        this.view.labelChildValue1.width = 96;
        this.view.labelChildValue1.x = 41;
        this.view.imageValue.visible = false;
        switch (type) {
            case ServerEnums.SystemType.ARENA:
                this.updateForPVP();
                break;
            case ServerEnums.SystemType.DAILY_BOSS:
                this.updateForDailyBoss();
                break;
            case ServerEnums.SystemType.SECRET_INSTANCE:
                this.updateSecret();
                break;
            case ServerEnums.SystemType.LADDER:
                this.updateLadder();
                break;
            case ServerEnums.SystemType.GUARD_SHIP:
                this.udpateGuardShip();
                break;
            case ServerEnums.SystemType.TEAM_INSTANCE:
                this.updateTeamChallenge();
                break;
            case ServerEnums.SystemType.PET_DUNGEON:
                this.updatePetDungeon();
                break;
            case ServerEnums.SystemType.COLLECTIBLES_DUNGEON:
                this.updateCollectiblesDungeon();
                break;
            default:
                //测试一直以为这个是bug，一直反馈，先注释掉
                // console.error(`模块类型错误. moduleId = ${moduleId}`)
                break;
        }
    }

    onClickPanel() {
        if (!this._systemType) {
            return;
        }

        if (!this._isCanPlay) {
            console.info(`玩家点击了未解锁的模块. moduleId = ${this._moduleConfig?.id}`);
            const lockDesc = this.view.labelLockTitle.text || "";
            GIns.floatingTextMgr.showTips(lockDesc);
            return;
        }

        if (this._systemType === ServerEnums.SystemType.ARENA) {
            G.UIManager.open(PVPUIKeys.PVPMainView);
        } else if (this._systemType === ServerEnums.SystemType.SECRET_INSTANCE) {
            if (!SecretAreaManager.ins().isActivityEnd()) {
                G.UIManager.open(UISecretAreaKey.SecretAreaMainView);
            }
        } else if (this._systemType === ServerEnums.SystemType.DAILY_BOSS) {
            if (ModuleOpenManager.ins().isCanOpenModule(this._systemType)) {
                G.UIManager.open(DailyBossUIKeys.DailyBossMainView);
            }
        } else if (this._systemType === ServerEnums.SystemType.LADDER) {
            if (ModuleOpenManager.ins().isCanOpenModule(this._systemType)) {
                G.UIManager.open(GodSequenceUIKeys.GodSequenceChooseView);
            }
        } else if (this._systemType === ServerEnums.SystemType.GUARD_SHIP) {
            if (ModuleOpenManager.ins().isCanOpenModule(this._systemType)) {
                G.UIManager.open(UIGuardShipConfig.GuardShipMainView);
            }
        } else if (this._systemType === ServerEnums.SystemType.TEAM_INSTANCE) {
            if (ModuleOpenManager.ins().isCanOpenModule(this._systemType)) {
                G.UIManager.open(TeamChallengeUIKeys.TeamChallengeMainView);
            }
        } else if (this._systemType === ServerEnums.SystemType.PET_DUNGEON) {
            if (ModuleOpenManager.ins().isCanOpenModule(this._systemType)) {
                if (GIns.petDungeonMgr.isActive() == false) {
                    GIns.floatingTextMgr.showTips('未开启');
                    return;
                }
                if (GIns.petDungeonModel.curMaxFloorId > 0) {
                    //有记录直接进入地图
                    GIns.petDungeonMgr.enterPetDungeon();
                } else {
                    G.UIManager.open(UIPetDungeonConfig.PetDungeonMainView);
                }
            }
        } else if (this._systemType === ServerEnums.SystemType.COLLECTIBLES_DUNGEON) {
            if (ModuleOpenManager.ins().isCanOpenModule(this._systemType)) {
                G.UIManager.open(UICollectiblesDungeonConfig.CollectiblesDungeonMainView);
            }
        } else {
            console.error(`未开发 | 玩法系统类型 = ${this._systemType}`)
        }
    }

    // JJC
    private updateForPVP() {
        // time
        GameTimer.ins().clear(this, this.updatePVPCountDownTimeText);
        GameTimer.ins().frameLoop(10, this, this.updatePVPCountDownTimeText);

        const context = PVPModel.ins().getContext();
        // this.view.labelChildTitle1.autoSize = 
        // 积分
        const score = context.score;
        // 排名
        const myRankNum = context.myRankNum;
        this.view.imageValue.visible = true;
        this.view.imageValue.icon = context.getSmallLogoAssetPath();

        this.view.labelChildTitle1.text = "排名";
        if (myRankNum > 0) {
            this.view.labelChildValue1.text = `${myRankNum}`;

        } else {
            this.view.labelChildValue1.text = `无排名`;
        }
        this.view.labelChildTitle2.text = ``;
        this.view.labelChildValue2.text = `${score}`;

        this.updatePVPCountDownTimeText();
    }

    // 每日boss
    private updateForDailyBoss() {
        // time
        GameTimer.ins().clear(this, this.updateDailyBossCountDownTimeText);
        GameTimer.ins().frameLoop(10, this, this.updateDailyBossCountDownTimeText);

        const context = DailyBossModel.ins().context;
        // 排名
        const myRankNum = context.getMyRankNum();

        this.view.labelChildTitle1.text = "排名";
        if (myRankNum > 0) {
            this.view.labelChildValue1.text = `${myRankNum}`;
        } else {
            this.view.labelChildValue1.text = `无排名`;
        }
        this.view.labelChildTitle2.text = "今日倒计时"

        const desc = I18nManager.ins().translateOrBlank(this._config?.desc);
        const bossName = DailyBossConfigManager.getBossThemeConfigByBossType(context.getBossType())?.name || "";
        this.view.labelDesc.text = `${desc} ${bossName}`;

    }


    //秘境
    private updateSecret() {

        this.view.labelChildTitle2.text = '';
        this.view.labelChildValue2.text = '';
        //先隐藏，后面做了赛季再放开
        // this.view.labelChildTitle2.text = "结束倒计时"
        // //倒计时
        // let endTime = SecretAreaManager.ins().endTime - G.TimeManager.serverNow;
        // if (!SecretAreaManager.ins().isActivityEnd()) {
        //     const timeText = TimeUtils.formatTimeMsToDayHourMinuteText(endTime);
        //     this.view.labelChildValue2.text = timeText;
        // } else {
        //     this.view.labelChildValue2.text = "活动已结束";
        // }
        //排名
        this.view.labelChildValue1.text = SecretAreaManager.ins().rank > 0 ? (SecretAreaManager.ins().rank + "") : "无排名";
    }

    //守卫母舰
    private udpateGuardShip() {
        // 排名
        const myRankNum = GIns.guardShipModel.myRank

        this.view.labelChildTitle1.text = "排名";
        if (myRankNum > 0) {
            this.view.labelChildValue1.text = `${myRankNum}`;
        } else {
            this.view.labelChildValue1.text = `无排名`;
        }
        this.view.labelChildTitle2.text = "层数"

        const desc = I18nManager.ins().translateOrBlank(this._config?.desc);
        this.view.labelDesc.text = `${desc}`;

        let floorId: string = '0'
        if (GIns.guardShipModel.curFloor > 0) {
            let cfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig, GIns.guardShipModel.curFloor)
            if (cfg) {
                floorId = cfg.name
            }
        }
        this.view.labelChildValue2.text = `${floorId}层`;
    }

    //宠物副本
    private updatePetDungeon() {
        GameTimer.ins().clear(this, this.updatePetDungeonCountDownTimeText);

        const myRankNum = GIns.petDungeonModel.myRank;
        // 排名
        this.view.labelChildTitle1.text = "排名";
        if (myRankNum > 0) {
            this.view.labelChildValue1.text = `${myRankNum}`;
        } else {
            this.view.labelChildValue1.text = `无排名`;
        }
        if (GIns.petDungeonModel.activityInfo) {
            if (GIns.petDungeonMgr.isActive()) {
                //开启
                this.view.labelChildTitle2.text = "结算倒计时"
                this._endTime = GIns.petDungeonModel.activityInfo.endTime;
            } else {
                //开启
                this.view.labelChildTitle2.text = "下次开启时间";
                this._endTime = GIns.petDungeonModel.activityInfo.nextStartTime;
            }
            GameTimer.ins().frameLoop(10, this, this.updatePetDungeonCountDownTimeText); // 排名
        } else {
            this.view.labelChildTitle2.text = "未开启";
            this.view.labelChildValue2.text = '';
        }

        const desc = I18nManager.ins().translateOrBlank(this._config?.desc);
        this.view.labelDesc.text = `${desc}`;
    }

    //收藏品副本
    protected updateCollectiblesDungeon(): void {
        // 排名
        this.view.getController("type").selectedIndex = EnumGameModeTabCompType.COLLECTIBLES_DUNGEON;
        this.view.labelChildTitle1.text = "章节";
        let maxPassLevelId = GIns.collectiblesDungeonModel.maxPassLevelId;
        if (maxPassLevelId > 0) {
            let vo = GIns.collectiblesDungeonModel.getLevelVo(maxPassLevelId);
            this.view.labelChildValue1.text = `${vo?.cfg.name}`;
        } else {
            this.view.labelChildValue1.text = `无`;
        }

        this.view.labelChildTitle2.text = "";
        let totalStar: number = 0;
        let chapterVoMap = GIns.collectiblesDungeonModel.chapterVoMap;
        chapterVoMap?.forEach((vo) => {
            totalStar += vo.curStar;
        })
        this.view.labelChildValue2.text = totalStar + '';
    }

    // cdt
    updatePVPCountDownTimeText() {
        // 一个说要时间, 一个说不要时间 | 又改成要时间了我晕
        const curTimeMs = G.TimeManager.serverNow;
        const nextRefreshTimeMs = PVPUtils.getPVPDailyNextRefreshTimeMs(curTimeMs);

        const restTimeMs = Math.max(0, nextRefreshTimeMs - curTimeMs);

        const timeText = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);
        this.view.labelDesc.text = `结算倒计时 ${timeText}`;
        // this.view.labelDesc.text = "";
    }

    // 每日boss倒计时
    updateDailyBossCountDownTimeText() {
        // 一个说要时间, 一个说不要时间 | 又改成要时间了我晕
        const curTimeMs = G.TimeManager.serverNow;
        const restTimeMs = DailyBossUtils.getRestTimeMs(curTimeMs);
        const timeText = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);
        this.view.labelChildValue2.text = `${timeText}`;
        // this.view.labelDesc.text = "";
    }

    // 宠物副本倒计时
    updatePetDungeonCountDownTimeText() {
        // 一个说要时间, 一个说不要时间 | 又改成要时间了我晕
        const curTimeMs = G.TimeManager.serverNow;
        let restTimeMs = this._endTime - curTimeMs;
        if (restTimeMs <= 0) {
            restTimeMs = 0;
        }
        const timeText = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);
        this.view.labelChildValue2.text = `${timeText}`;
    }

    // 神之序列
    private updateLadder() {
        this.view.getController("type").selectedIndex = EnumGameModeTabCompType.GOD_SEQUENCE;

        if (GodSequenceController.ins().isOpenAll) {
            this._raceIdConfigs = GodSequenceConfigManager.getTypeConfigArray().map(it => it.id);
        } else {
            this._raceIdConfigs = GodSequenceConfigManager.getTodayTypeConfig().map(it => it.id);
        }
        this.view.godItemList.numItems = this._raceIdConfigs.length;
    }


    /**组队副本更新 */
    private updateTeamChallenge() {
        GameTimer.ins().clear(this, this.updateDailyBossCountDownTimeText);
        // 排名
        // const myRankNum = GIns.guardShipModel.myRank
        // if (myRankNum > 0) {
        //     this.view.labelChildValue1.text = `${myRankNum}`;
        // } else {
        //     this.view.labelChildValue1.text = `无排名`;
        // }

        this.view.labelChildTitle1.text = "进度";

        this.view.labelChildTitle2.text = '';
        this.view.labelChildValue2.text = '';

        const desc = I18nManager.ins().translateOrBlank(this._config?.desc);
        this.view.labelDesc.text = `${desc}`;

        this.view.labelChildValue1.width = 200;
        this.view.labelChildValue1.x = 41;
        ///章节信息
        const intanceCfg = TeamChallengeConfigManager.getCurChapterCfg(true);
        if (!intanceCfg) {
            this.view.labelChildValue1.text = `已通关`;
        } else {
            const id = TeamChallengeConfigManager.getCurInstanceConfig(true).id
            const info = TeamChallengeModel.ins().getFloorInfo(id);
            this.view.labelChildValue1.text = `${intanceCfg.chapterName} 第${info?.cur}关`;
        }

    }

    iRForGodItem(index: number, comp: RaceLogoComp) {
        const raceId = this._raceIdConfigs[index];
        comp.reset(raceId);
    }

    private refreshRedDot(type: ServerEnums.SystemType) {
        const path = RedDotUtils.getRedDotPathByModule(type);

        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        const isCanOpen = ModuleOpenManager.ins().isCanOpenModule(type, false);
        if (isCanOpen) {
            redDotCom.reset(path);
        } else {
            redDotCom.reset(RedDotKeys.Null);
        }
    }

}
