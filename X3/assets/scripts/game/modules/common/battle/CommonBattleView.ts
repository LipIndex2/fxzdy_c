import { tween, v3 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import BattleTimer from "db://assets/scripts/core/timer/BattleTimer";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import ObjectUtils from "db://assets/scripts/core/utils/ObjectUtils";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { WorldUnitTeam } from "db://assets/scripts/game/comm/battle/enum/BattleEnum";
import { LeaderSkillData } from "db://assets/scripts/game/comm/battle/skill/LeaderSkillData";
import { SkillData } from "db://assets/scripts/game/comm/battle/skill/SkillData";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BattleI18nKeys } from "db://assets/scripts/game/modules/battle/BattleI18nKeys";
import { BattleUIUtils } from "db://assets/scripts/game/modules/battle/utils/BattleUIUtils";
import { IBattleTeamHpChangeVo } from "db://assets/scripts/game/modules/battle/vo/IBattleTeamHpChangeVo";
import { CaptainSkillModel } from "db://assets/scripts/game/modules/captainSkill/model/CaptainSkillModel";
import {
    BattleForDailyBossHpComp
} from "db://assets/scripts/game/modules/common/battle/components/BattleForDailyBossHpComp";
import {
    CommonBattleTotalDamageComp
} from "db://assets/scripts/game/modules/common/battle/components/CommonBattleTotalDamageComp";
import { BattleForDailyBossData } from "db://assets/scripts/game/modules/common/battle/structs/BattleForDailyBossData";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { CommonI18nKeys } from "db://assets/scripts/game/modules/common/i18n/CommonI18nKeys";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { TimeManager } from "../../../../core/time/TimeManager";
import { BattleAttr } from "../../../comm/battle/attribute/BattleAttr";
import { BattleLogicManager } from "../../../comm/battle/BattleLogicManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import { WorldController } from "../../../comm/world/WorldController";
import GIns from "../../../GIns";
import { BattleModel } from "../../battle/model/BattleModel";
import { IBattleEnterData } from "../../battle/vo/IBattleEnterData";
import { HeroHeadSkillItem } from "../item/HeroHeadSkillItem";
import { CommonBattleManyHpComp } from "./components/CommonBattleManyHpComp";
import { SeasonManager } from "../../season/SeasonManager";
import { SeasonConfigManager } from "../../season/SeasonConfigManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import BattleSetting, { HpShowType } from "../../../comm/battle/config/BattleSetting";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { IBattleResultVo } from "./structs/IBattleResultVo";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

const { GObject } = fgui;

export class CommonBattleViewOpenArgs {
    // 战斗类型
    type: ServerEnums.FightType
    battleConfigId: number;
    data: BattleForDailyBossData | string | number | null = null;

    // optional
    private _bossName: string;

    static create(
        type: ServerEnums.FightType,
        battleConfigId: number,
        data?: BattleForDailyBossData | string | null
    ): CommonBattleViewOpenArgs {
        const args = new CommonBattleViewOpenArgs();
        args.type = type;
        args.battleConfigId = battleConfigId;
        args.data = data;
        if (data) {
            if (ObjectUtils.isString(data)) {
                args._bossName = data as string;
            }
        }
        return args;
    }


    get bossName(): string {
        return this._bossName;
    }
}

/**
 * 通用战斗界面
 */
export class CommonBattleView extends UIPage {

    static pkgName: string = "commBattle";
    static viewName: string = "CommonBattleView";

    // 战斗 type+configId
    private _fightType: ServerEnums.FightType;
    private _battleConfigId: number;
    private _title: string;

    // 战斗开始状态
    private _startTime: number;
    private _endTime: number;
    // <队伍类型, 血量变化>
    private _teamToHpStateMap: Map<WorldUnitTeam, IBattleTeamHpChangeVo> = new Map<WorldUnitTeam, IBattleTeamHpChangeVo>();
    // 战斗结果
    private _winFlag: boolean;
    // 英雄大招技能
    private _heroConfigSkillMap: { [heroId: number]: SkillData } = {}
    // 队长技能
    private _leadSkill: LeaderSkillData

    // 自动战斗 | default false
    private _autoFight: boolean = false;
    // 上阵 HeroIds
    private _heroConfigIds: BattleAttr[] = [];
    /**助战下标 */
    private _helpIndex: number = -1;
    /**援助英雄的头像 */
    private _helpHeroItem: HeroHeadSkillItem;

    // 外部对战斗特殊提供的数据
    private _data: BattleForDailyBossData | string | number | null = null;

    private get view(): ui.commBattle.battleView.CommonBattleView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_HP_CHANGED,
            NotificationKey.BATTLE_START_STATE,
            NotificationKey.BATTLE_SKILL_CD_UPDATE,
            NotificationKey.BATTLE_USE_SKILL,
            NotificationKey.CLOSE_BATTLE_VIEW,
            NotificationKey.BATTLE_RESULT,
            NotificationKey.BATTLE_START,
            NotificationKey.BATTLE_VIEW_SHOW_HELP_HERO,
            NotificationKey.SKIP_NOW_BATTLE_COMPLETE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.BATTLE_HP_CHANGED:
                // 血条
                this.onChangeTeamHp(args as IBattleTeamHpChangeVo)
                break;
            case NotificationKey.BATTLE_START_STATE:
                this.setBattleStartState(args as IBattleEnterData)
                break;
            case NotificationKey.BATTLE_RESULT:
                // 战斗结果
                this.onBattleResult(args as IBattleResultVo)
                break;
            case NotificationKey.BATTLE_SKILL_CD_UPDATE:
                // 刷新技能 CD
                this.onUpdateSkillCD(args as SkillData)
                break;
            case NotificationKey.CLOSE_BATTLE_VIEW:
                this.closeSelf();
                break;
            case NotificationKey.BATTLE_USE_SKILL:
                // 刷新技能 CD
                this.onUseSkill(args as SkillData)
                break;
            case NotificationKey.BATTLE_START:
                // 战斗开始
                this.onBattleStart()
                break;
            case NotificationKey.BATTLE_VIEW_SHOW_HELP_HERO:
                // 显示援助英雄
                this.onShowHelpHero()
                break;
            case NotificationKey.SKIP_NOW_BATTLE_COMPLETE:
                this.onSkilNowBattleComplete(args)
                break;
        }
    }

    private readonly __loopTimeMs = 200;

    public onInit(): void {
        G.Logger.debug(" onInit ")
        // btn close
        this.view.btnBack.onClick(this.onClickBack, this);
        // btn 自动战斗
        this.view.btnAutoFight.onClick(this.onClickAutoBattle, this);
        this.view.btnSkipFight.onClick(this.onClickSkipBattle, this);
        // 自动挑战中
        this.view.tipsAutoBattle.labelAutoBattle.text = BattleI18nKeys.AUTO_BATTLE;
        // 英雄列表
        this.view.heroList.itemRenderer = this.itemRendererForHero.bind(this);
    }

    private onBattleStart(): void {
        // 挂机时间
        this._endTime = GIns.battleMgr.battleLogic.getInitEndTime();
        this._startTime = TimeManager.serverNow;
        BattleTimer.ins().loop(this.__loopTimeMs, this, this.updateBattleView.bind(this))
        BattleTimer.ins().loop(this.__loopTimeMs, this, this.onUpdateCaptainSkill0CD);
        this._leadSkill = GIns.battleMgr.battleLogic.getSelfLeaderSkill();
        this.updateBattleView()
    }

    @LogBusiness("[通用战斗界面-open] ")
    public onOpen(args: CommonBattleViewOpenArgs): void {
        G.Logger.debug(" onOpen ")
        const battleConfigId = args.battleConfigId || 0;
        const battleConfig = G.TableManager.getDataById(table.battle.BattleConfig, battleConfigId);
        if (battleConfig == null) {
            console.error(`找不到战斗配置. battleConfigId= ${battleConfigId}`);
            return;
        }

        this._fightType = args.type;
        this._battleConfigId = battleConfigId;
        this._title = args.bossName || battleConfig.name;
        this._data = args.data;

        let leaderSkillFightType = this._fightType == ServerEnums.FightType.TRUNK_INSTANCE ? ServerEnums.FightType.TRUNK_MAP : this._fightType

        // 一开始在 cd 中
        // this.view.captainSkillComp.getController("inCdFlag").selectedIndex = 1;
        // this.view.captainSkillComp.cdComp.bar.value = 0;
        // this.view.captainSkillComp.cdComp.labelLv.text = CaptainSkillModel.ins().getShowLv(leaderSkillFightType);

        // 没有队长技, 隐藏
        // const isUseCaptain = FormationManager.ins().getCaptainIdByFightType(leaderSkillFightType) > 0;
        this.view.captainSkillComp.visible = false;

        // 是否自动战斗中
        this._autoFight = BattleLogicManager.ins().getAutoFight(FightType[battleConfig.fightType]);
        GIns.battleMgr.lockCamera(this._autoFight)
        this.view.btnSkipFight.visible = BattleSetting.getIsSkipBattleByType(this._fightType) >= 0;
        this.reset();
    }

    onClickAutoBattle() {

        this._autoFight = !this._autoFight
        G.Logger.fight(` onClickAutoBattle | 是否自动战斗 = ${this._autoFight} `)

        // if (this._autoFight) {
        //     G.FacadeManager.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO, "")
        // } else {

        // }

        // 自动战斗
        BattleLogicManager.ins().setAutoFight(this._fightType, this._autoFight);
        GIns.battleMgr.lockCamera(this._autoFight)
        this.updateAutoFightView();

        this.view.btnAutoFight.getController("clickFlag").selectedIndex = this._autoFight ? 1 : 0;
    }

    private onClickSkipBattle(): void {
        if (this._fightType == ServerEnums.FightType.LADDER && !GIns.godSequenceModel.context.canSkipBattle()) {
            GIns.floatingTextMgr.showTips(`购买校验基金后开启`);
            return
        }

        let cdController = this.view.btnSkipFight.getController("inCdFlag");
        if (cdController.selectedIndex == 1) {
            let beginBattleTime = TimeManager.serverNow - this._startTime;
            let skipBattleTime = BattleSetting.getIsSkipBattleByType(this._fightType)
            let nowSkipTime = beginBattleTime / 1000;
            let restCdSecond = Math.ceil(skipBattleTime - nowSkipTime);
            GIns.floatingTextMgr.showTips(`还有${Math.ceil(restCdSecond)}秒才可以跳过战斗`);
            return
        }
        UIManager.ins().open(UICommonKey.CommonSkipBattleView)
        FacadeManager.ins().emit(NotificationKey.SKIP_NOW_BATTLE, this._fightType);
    }

    private onSkilNowBattleComplete(type: FightType): void {
        if (this._fightType == type) {
            UIManager.ins().close(UICommonKey.CommonSkipBattleView)
        }
    }

    private updateAutoFightView() {
        this.view.getController("autoBattleFlag").selectedIndex = this._autoFight ? 1 : 0;
    }


    public onClose(dontDispose: boolean = false): void {
        // 退出战斗
        if (!dontDispose) {
            if (!WorldController.ins().isClickNextLevel) {
                // 非手动
                G.FacadeManager.emit(NotificationKey.EXIT_BATTLE);
            }
            BattleTimer.ins().clearAll(this)
        }
    }

    private reset() {

        // battle type UI
        if (this._fightType == ServerEnums.FightType.DAILY_BOSS) {
            this.view.getController("battleType").selectedIndex = 1;
            this.resetDailyBossHp();
        } else if (this._fightType == ServerEnums.FightType.LEAGUE_BOSS) {
            this.view.getController("battleType").selectedIndex = 2;
            this.resetManyHpBar();
        } else if (this._fightType == ServerEnums.FightType.GUARD_SHIP) {
            this.view.getController("battleType").selectedIndex = 3;
        } else if (this._fightType == ServerEnums.FightType.LEAGUE_EXPLORE) {
            this.view.getController("battleType").selectedIndex = 4;
        } else if (this._fightType == ServerEnums.FightType.SEASON_BOSS) {
            this.view.getController("battleType").selectedIndex = 2;
            this.resetManyHpBar();
        } else {
            this.view.getController("battleType").selectedIndex = 0;
        }

        // dam
        FguiScriptUtils.toMyScriptClass(this.view.damageComp, CommonBattleTotalDamageComp)
            .reset(this._fightType);

        // 按钮：自动战斗
        this.view.btnAutoFight.getController("clickFlag").selectedIndex = this._autoFight ? 1 : 0;
        this.updateAutoFightView();


        // 图标
        const battleConfigId = this._battleConfigId
        const battleConfig = G.TableManager.getDataById(table.battle.BattleConfig, battleConfigId);
        if (!battleConfig) {
            G.Logger.error(`找不到战斗配置. BattleConfig.id= ${battleConfigId}`)
            return;
        }

        //是否显示退出
        this.view.btnBack.visible = battleConfig.quitFight;
        this.view.labelRestTime.visible = true;
        if (FightType[battleConfig.fightType] == ServerEnums.FightType.WORLD_BOSS) {
            //世界boss 有自己的战斗ui
            this.view.pvpHp.visible = false;
            this.view.labelLevelTitle.visible = false;
            this.view.compLevelNameTips.visible = false;
        } else if (FightType[battleConfig.fightType] == ServerEnums.FightType.SECRET_INSTANCE
            || FightType[battleConfig.fightType] == ServerEnums.FightType.MAP_INSTANCE
            || FightType[battleConfig.fightType] == ServerEnums.FightType.SEASON_SECRET) {
            this.view.pvpHp.visible = false;
            this.view.captainSkillComp.visible = false;
            this.view.labelLevelTitle.visible = false;
            this.view.btnAutoFight.visible = false;
            this.view.labelRestTime.visible = false;
            this.view.btnBack.visible = false;
            this.showAnimTitle();
        }
        else if (FightType[battleConfig.fightType] == ServerEnums.FightType.TRIAL) {
            this.view.pvpHp.visible = false;
            this.view.labelRestTime.visible = false;
            this.view.compLevelNameTips.visible = false;
        }
        else if (FightType[battleConfig.fightType] == ServerEnums.FightType.GUARD_SHIP) {
            this.view.pvpHp.visible = true;
            this.view.labelLevelTitle.visible = true;
            this.view.btnAutoFight.visible = false;
            this.view.btnBack.visible = false;
            this.showAnimTitle();
        } else if (FightType[battleConfig.fightType] == ServerEnums.FightType.PET_DUNGEON) {
            this.view.pvpHp.visible = true;
            this.view.labelLevelTitle.visible = true;
            this.view.compLevelNameTips.visible = false;
        } else {
            this.view.pvpHp.visible = true;
            this.view.labelLevelTitle.visible = true;
            this.showAnimTitle();
        }

        // 战斗对手名
        this.view.labelLevelTitle.text = this._title;

        // 进度条
        this.view.progressBar1.value = 100;
        this.view.progressBar2.value = 100;

        this._teamToHpStateMap = new Map<WorldUnitTeam, IBattleTeamHpChangeVo>()

        for (let i = 0; i < this._heroConfigIds.length; i++) {
            let a: HeroHeadSkillItem = this.view.heroList.getChildAt(i)
            a.reset()
        }
    }

    /**
     * 更新战斗时间
     */
    updateBattleView() {
        // 剩余时间
        this.updateRestBattleTime();
        // 血条
        this.updateHpView();
        // skill
        this.updateSkillCdView();
    }

    /**标题动画*/
    private showAnimTitle(): void {
        if (this.view.compLevelNameTips.visible) {
            this.view.compLevelNameTips.title.text = this._title;
            tween(this.view.compLevelNameTips.node)
                .by(0.5, {
                    position: v3(0, 20, 0)
                })
                .start();
            this.view.getTransition("animTitle").play(() => {
                this.view.compLevelNameTips.visible = false;
            });
        }
    }

    private updateHpView() {
        this._teamToHpStateMap.forEach((hpChangeVo, teamId) => {
            const curHp = hpChangeVo.curHp;
            const maxHp = hpChangeVo.totalHP;
            let hpPercent = 100;
            if (curHp <= 0) {
                hpPercent = 0;
            } else {
                hpPercent = Math.ceil(curHp / maxHp * 100);
            }

            if (teamId === WorldUnitTeam.Self) {
                this.view.progressBar1.value = hpPercent;
            }
            if (teamId === WorldUnitTeam.Enemy) {
                this.view.progressBar2.value = hpPercent;
            }
        })
    }

    // 刷新技能 CD
    private updateSkillCdView() {
        // this.view.heroList.refreshVirtualList()
        for (let i = 0; i < this._heroConfigIds.length; i++) {
            let a: HeroHeadSkillItem = this.view.heroList.getChildAt(i)
            this.itemRendererForHero(i, a)
        }
    }

    /**
     * 更新剩余时间
     * @private
     */
    private updateRestBattleTime() {
        this.view.btnSkipFight.getController("lock").selectedIndex = 0;
        if (this._fightType == ServerEnums.FightType.LADDER && !GIns.godSequenceModel.context.canSkipBattle()) {
            this.view.btnSkipFight.getController("inCdFlag").selectedIndex = 1;
            this.view.btnSkipFight.bgMask.fillAmount = 1;
            this.view.btnSkipFight.title = "";
            this.view.btnSkipFight.getController("lock").selectedIndex = 1;
            return
        }

        // 剩余战斗时间
        const restBattleTimeMs = this._endTime - TimeManager.serverNow;
        if (this.view.btnSkipFight.visible) {
            let beginBattleTime = TimeManager.serverNow - this._startTime
            let cdController = this.view.btnSkipFight.getController("inCdFlag");
            let skipBattleTime = BattleSetting.getIsSkipBattleByType(this._fightType)
            let nowSkipTime = beginBattleTime / 1000;
            if (nowSkipTime < skipBattleTime) {
                cdController.selectedIndex = 1;
                this.view.btnSkipFight.bgMask.fillAmount = Math.max(1 - nowSkipTime / skipBattleTime, 0);
                let restCdSecond = Math.ceil(skipBattleTime - nowSkipTime);
                this.view.btnSkipFight.title = Math.ceil(restCdSecond) + "";
            }
            else {
                cdController.selectedIndex = 0;
                this.view.btnSkipFight.bgMask.fillAmount = 1;
                this.view.btnSkipFight.title = "";
            }
        }
        if (restBattleTimeMs <= 0) {
            this.view.labelRestTime.text = TimeUtils.formatTimeMsToLevelTimeText(0)
            return;
        }
        this.view.labelRestTime.text = TimeUtils.formatTimeMsToLevelTimeText(restBattleTimeMs)
    }


    /**
     * 关闭战斗
     * @param manualCloseFlag
     */
    handleBattleResult(manualCloseFlag: boolean = false) {
        // 战斗时间
        this.view.labelRestTime.visible = false;
        BattleTimer.ins().clearAll(this);
        // 手动关闭
        if (manualCloseFlag) {
            // 主动取消战斗
            G.FacadeManager.emit(NotificationKey.BATTLE_CANCEL);
            // 关闭战斗界面, 回到主底图
            this.closeSelf()
            return;
        }

        // 胜利结算
        const winFlag = this._winFlag;
        if (winFlag) {
            this.view.progressBar2.value = 0;
        } else {
            this.view.progressBar1.value = 0;
        }
    }

    private onClickBack(event: fgui.Event) {
        BattleModel.ins().showExitView(CommonI18nKeys.ExitBattleAlertTitle, CommonI18nKeys.ExitBattleAlertContent, () => {
            this.handleBattleResult(true);
        })
    }

    /**
     * 英雄
     * @param index
     * @param comp
     * @private
     */
    private itemRendererForHero(index: number,
        comp: HeroHeadSkillItem
    ) {
        const heroConfigId = this._heroConfigIds[index];
        if (!heroConfigId) {
            return
        }
        let heroConfig = G.TableManager.getDataById(table.hero.HeroConfig, heroConfigId.getConfigId());
        if (!heroConfig) {
            return;
        }

        // cd 
        let cdMaxTimeMs = 0;
        let restCdTimeMs = 0;
        let restPreCdTimeMs = 0;
        let preCdMaxTimeMs = 0;
        let skillData = this._heroConfigSkillMap[heroConfigId.getConfigId()]
        if (skillData) {
            restCdTimeMs = skillData.cdTimeMs;
            cdMaxTimeMs = skillData.cdMaxTimeMs;
            preCdMaxTimeMs = skillData.preCdMaxTimeMs;
            restPreCdTimeMs = skillData.preCdTimeMs;
            if (restCdTimeMs) {
                comp.setData(heroConfigId, cdMaxTimeMs, restCdTimeMs, false);
            } else if (GIns.battleMgr.battleLogic.isInBattle()) {
                comp.setData(heroConfigId, preCdMaxTimeMs, restPreCdTimeMs, false);
            } else
                comp.setData(heroConfigId, cdMaxTimeMs, 0, false);
        }

        if (this._helpIndex == index) {
            comp.isHelpHero(true);
            if (!this._helpHeroItem) {
                comp.width = 0;
                comp.alpha = 0;
                comp.visible = false;
                this._helpHeroItem = comp;
            }
        } else {
            comp.isHelpHero(false);
        }
    }

    //援助英雄动画
    private onShowHelpHero(): void {
        if (this._helpHeroItem) {
            this._helpHeroItem.visible = true;
            tween(this._helpHeroItem).to(0.5, { alpha: 1, width: 108 }).start();
        }
    }

    // 出战英雄
    private updateHeroList() {
        this._heroConfigIds = []
        let heros = GIns.battleMgr.heroes
        for (let i = 0; i < heros.length; i++) {
            this._heroConfigIds.push(heros[i].attr)
            if (heros[i].isHelpHero) {
                //援助英雄
                this._helpIndex = i;
            }
        }
        this.view.heroList.numItems = this._heroConfigIds.length;
    }

    // @LogBusiness("战场 - 血量变化")
    private onChangeTeamHp(changeVo: IBattleTeamHpChangeVo) {
        if (!changeVo) {
            return;
        }
        DebugUtils.isDebugMode() && console.log(changeVo, " updateBattleData ")
        this._teamToHpStateMap.set(changeVo.teamId, changeVo);
    }

    @LogBusiness("战场 - 战斗开始状态")
    private setBattleStartState(args1: IBattleEnterData) {
        this.updateHeroList()
        this._endTime = GIns.battleMgr.battleLogic.getInitEndTime();
        this.updateBattleView();

        if (this._fightType == ServerEnums.FightType.LEAGUE_EXPLORE) {
            this.view.lbMyName.text = GIns.playerModel.playerName;
            this.view.lbEnemyName.text = args1.defenderName;
        }
    }

    @LogBusiness("战场 - 战斗结束")
    private onBattleResult(vo: IBattleResultVo) {
        if (vo.fightType == this._fightType) {
            this._winFlag = vo.isWin;

            G.Logger.debug(`战斗结果: ${vo.isWin}, 关闭 UI`)
            this.handleBattleResult();
        }
    }

    private onUseSkill(skillData: SkillData) {
        if (skillData.skillIndex == 2 && skillData.owner.teamId == WorldUnitTeam.Self) {
            for (let i = 0; i < this._heroConfigIds.length; i++) {
                if (this._heroConfigIds[i].getConfigId() == skillData.owner.attr.getHeroConfigId()) {
                    let heroItem: HeroHeadSkillItem = this.view.heroList.getChildAt(i)
                    heroItem?.showHitEffect()
                    break;
                }
            }
        }
    }

    /**
     * 刷新角色节能
     * @param skillData
     * @private
     */
    private onUpdateSkillCD(skillData: SkillData) {
        if (!skillData) {
            return
        }
        if (!(skillData instanceof SkillData)) {
            G.Logger.error(`skillData 不是 SkillData 类型, 战斗侧有问题! `, skillData)
            return;
        }

        // TODO 只展示技能2 = 大招 | 先苟着先
        if (skillData.skillIndex != 2) {
            return;
        }

        let heroConfigId = skillData.getHeroConfigId();
        this._heroConfigSkillMap[heroConfigId] = skillData;
    }

    onUpdateCaptainSkill0CD() {
        if (this.view.captainSkillComp.visible == false) {
            return;
        }
        let restCdPercent = 100;
        if (this._leadSkill) {
            restCdPercent = this._leadSkill.progress() * 100
            this.view.captainSkillComp.cdComp.bar.value = restCdPercent;
            this.view.captainSkillComp.getController("inCdFlag").selectedIndex = restCdPercent >= 100 ? 0 : 1;
        }
    }

    // 每日 boss
    private resetDailyBossHp() {
        if (this._data instanceof BattleForDailyBossData) {
            FguiScriptUtils.toMyScriptClass(this.view.bossHpComp, BattleForDailyBossHpComp)
                .reset(this._fightType, this._data as BattleForDailyBossData);
        }

    }

    // 多血条组件
    private resetManyHpBar() {
        let hpCount = 1;
        let bossHeadPath = ""
        let monsterCfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(this._battleConfigId);
        let monsterCfg = monsterCfgs[0];
        bossHeadPath = monsterCfg.headPath;
        const com = FguiScriptUtils.toMyScriptClass(this.view.manyHpbar, CommonBattleManyHpComp);
        if (this._fightType == ServerEnums.FightType.LEAGUE_BOSS) {
            let cfgs = G.TableManager.getAllData(table.league.LeagueBossConfig);
            let cfg = cfgs.find(it => it.battleConfigId == this._battleConfigId);
            if (cfg) {
                hpCount = cfg.hpBarCount;
            }
            com.reset(this._fightType, this._battleConfigId, hpCount, bossHeadPath);
        } else if (this._fightType == ServerEnums.FightType.SEASON_BOSS) {
            const hps: number[] = SeasonConfigManager.getHpBars();
            com.reset(this._fightType, this._battleConfigId, null, bossHeadPath, hps);
        }

    }

}

UIScriptManager.bindScript(UICommonKey.CommonBattleView, CommonBattleView);