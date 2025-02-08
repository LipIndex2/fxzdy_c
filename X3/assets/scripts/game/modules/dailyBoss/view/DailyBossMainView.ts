import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { SkillConfigManager } from "db://assets/scripts/game/comm/battle/skill/config/SkillConfigManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BattleUIUtils } from "db://assets/scripts/game/modules/battle/utils/BattleUIUtils";
import { RightTabBtn } from "db://assets/scripts/game/modules/common/btn/RightTabBtn";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { DailyBossUIKeys } from "db://assets/scripts/game/modules/dailyBoss/DailyBossUIKeys";
import { DailyBossDifficultyComp } from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossDifficultyComp";
import {
    DailyBossProgressRewardComp
} from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossProgressRewardComp";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { DailyBossSkillItem } from "db://assets/scripts/game/modules/dailyBoss/skill/DailyBossSkillItem";
import { DailyBossUtils } from "db://assets/scripts/game/modules/dailyBoss/utils/DailyBossUtils";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { DailyBossController } from "../DailyBossController";
import { DailyBossRecommendInfo } from "../context/DailyBossRecommendInfo";
import { DailyBossRecommendHeroListItem } from "./DailyBossRecommendView";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";

/**
 * 每日 Boss
 */
export class DailyBossMainView extends UIPage {

    static pkgName: string = "dailyBoss";
    static viewName: string = "DailyBossMainView";


    private _tabConfigs: table.dailyboss.DailyBossTabConfig[] = [];
    private _progressConfigs: table.dailyboss.DailyBossProgressConfig[] = [];
    private _bossType: number = 0;
    private _skillIdArray: string[] = [];
    protected _bossId: number = 0

    private get view(): ui.dailyBoss.DailyBossMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.DAILY_BOSS_INFO_CHANGE,
            NotificationKey.DAILY_BOSS_RANK_UPDATE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.DAILY_BOSS_Formation_Rank,
            NotificationKey.AD_GET_REWARD_COMPLETE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.SYSTEM_NEW_DAY:
                this.reset();
                break;
            case NotificationKey.DAILY_BOSS_INFO_CHANGE:
                this.resetBossPart();
                break;
            case NotificationKey.DAILY_BOSS_RANK_UPDATE:
                this.updateRankPart();
                break;
            case NotificationKey.DAILY_BOSS_Formation_Rank:
                this.updateRecommonView();
                break;
            case NotificationKey.AD_GET_REWARD_COMPLETE:
                if (args == ServerEnums.AdvertType.DAILY_BOSS) {
                    this.updateChallengeBtn()
                }
                break
        }

    }

    protected onInit() {

        const redDotCom = RedDotUtils.castComp(this.view.btnChallenge.redDot);
        redDotCom.reset(RedDotKeys.dailyBoss_challenge);

        this.view.btnBack.onClick(this.closeMe, this);
        this.view.btnRule.onClick(this.onClickBtnRule, this);
        this.view.recommendBtn.onClick(this.onClickRecommend, this);
        this.view.btnChallenge.onClick(this.onClickChallenge0, this);
        this.view.btnSetUp.onClick(this.onClickSetUp0, this);
        this.view.myRankComp.btnSeeReward.onClick(this.seeMyRewardInfo, this);
        this.view.btnBack.onClick(this.closeMe, this);
        this.view.btnPlayAd.onClick(this.onClickPlayAd, this);
        this.view.rewardList.setVirtual();
        this.view.rewardList.itemRenderer = this.irBar.bind(this);
        this.view.skillList.itemRenderer = this.itemRendererForSkill.bind(this);
        this.view.list_hero.setVirtual()
        this.view.list_hero.itemRenderer = this.itemRendererForHero.bind(this)

        this.view.tabList.itemRenderer = this.itemRendererForTab.bind(this);
        this._tabConfigs = DailyBossConfigManager.getAllTabConfigs();
        this.view.tabList.numItems = this._tabConfigs.length;
        this.view.getTransition("t0").play();
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        this.reset();
    }

    private onClickRecommend(): void {
        UIManager.ins().open(DailyBossUIKeys.DailyBossRecommendView, this._bossType);
        GIns.dailyBossModel.sendDailyBossFormationRankItem(this._bossType)
    }

    private recommendList: DailyBossRecommendInfo
    private updateRecommonView(): void {
        this.recommendList = GIns.dailyBossModel.context.getRecommendFormation(this._bossType)[0]
        this.view.list_hero.numItems = this.recommendList.heroList.length;
    }

    protected itemRendererForHero(index: number, item: DailyBossRecommendHeroListItem): void {
        if (this.recommendList)
            item.reset(this.recommendList.heroList[index], false)
    }

    private reset() {
        GameTimer.ins().clearAll(this);
        GameTimer.ins().frameLoop(10, this, this.onUpdateResetTime);

        DailyBossModel.ins().sendLoadInfo();
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        GameTimer.ins().clearAll(this);

        super.onClose();
    }

    closeMe() {
        this.closeSelf();
    }

    onUpdateResetTime() {
        this.view.labelResetTime.text = DailyBossUtils.getRestTimeText();
    }

    onClickBtnRule() {
        RuleController.ins().openRule(EnumRuleKeys.DAILY_BOSS, this.view.btnRule);
    }

    // 奖励进度条
    irBar(
        index: number,
        comp: DailyBossProgressRewardComp,
    ) {
        const config = this._progressConfigs[index];
        if (!config) {
            return;
        }
        // 奖励 comp
        comp.reset(this._bossType, config);
    }

    // skill
    itemRendererForSkill(
        index: number,
        comp: DailyBossSkillItem,
    ) {
        const skillId = this._skillIdArray[index];
        if (!skillId) {
            return;
        }

        // skillId 是唯一, 含 lv
        comp.reset(skillId);
    }

    // tab
    itemRendererForTab(
        index: number,
        comp: RightTabBtn,
    ) {
        const tabConfig = this._tabConfigs[index];
        if (!tabConfig) {
            return;
        }
        comp.reset(
            tabConfig.name,
            tabConfig.iconPath,
            tabConfig.jumpId
        );


    }

    // 查看我的奖励
    seeMyRewardInfo() {
        G.UIManager.open(DailyBossUIKeys.DailyBossBalanceView);
    }

    // 加载 boss 信息
    private resetBossPart() {
        const context = DailyBossModel.ins().context;
        this._bossId = 0
        // vs ? boss
        const bossConfig: table.dailyboss.DailyBossConfig = context.getCurrentBossConfig()
        if (!bossConfig) {
            return;
        }
        const bossType = bossConfig.bossType;
        this._bossType = bossType;
        // boss theme
        const bossTypeConfig: table.dailyboss.DailyBossThemeConfig = DailyBossConfigManager.getBossThemeConfigByBossType(bossType);
        if (!bossTypeConfig) {
            return;
        }
        const hardId = bossConfig.difficulty;

        const battleConfigId = bossConfig.battleConfigId;
        try {

            // 怪物配置
            let cfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);
            // BOSS 一定只有一个
            const monsterConfig = cfgs[0];
            if (!monsterConfig) {
                console.error(`boss配置错误. battleConfigId=${battleConfigId} | 关联的怪物配置不存在`);
                return;
            }
            const bossSpineModel = FguiScriptUtils.toMyScriptClass(this.view.bossModelNode, ModelNode);
            bossSpineModel.loadByModelId(bossTypeConfig.spineModelId);

            // 技能
            const skillIdArray = monsterConfig.skillIds
                .map(it => {
                    return SkillConfigManager.getSkillConfigById(it);
                })
                .filter(it => {
                    if (!it) {
                        return false;
                    }
                    return StringUtils.isNotBlank(it.icon);
                })
                .map(it => it.id);
            this._skillIdArray = skillIdArray;
            this.view.skillList.numItems = skillIdArray.length;

        } catch (error) {
            console.error(`boss形象报错. battleConfigId=${battleConfigId} `, error);
        }
        // first rank
        DailyBossModel.ins().sendLoadBossRank({
            bossType: bossType,
            page: 1,
        });
        this._progressConfigs = context.getCurrentHardProgressConfig();
        this.view.rewardList.numItems = this._progressConfigs.length;
        this.view.rewardList.refreshVirtualList();

        // boss name
        this.view.labelHeaderTitle.text = bossTypeConfig.name;

        // hot hero
        // FguiScriptUtils.toMyScriptClass(this.view.hotHeroComp, DailyBossHotHeroComp)
        //     .reset(bossTypeConfig);

        this.view.damageComp.labelValue.text = context.getMyCurrentProgressText();
        const isHaveDamage = context.isCurrentHardHaveProgressValue();
        this.view.damageComp.getController("isHaveIn").selectedIndex = isHaveDamage ? 1 : 0;
        // left-top
        FguiScriptUtils.toMyScriptClass(this.view.difficultyComp, DailyBossDifficultyComp)
            .reset(hardId);

        // challenge btn
        this.updateChallengeBtn()

        let toIndex = 0;
        for (let i = 0; i < this._progressConfigs.length; i++) {
            const config = this._progressConfigs[i];
            const index = context.isHaveGainProgressId(config.id) ? i : -1;
            toIndex = Math.max(toIndex, index)
        }
        this.view.rewardList.scrollToView(toIndex, true);
        GIns.dailyBossModel.sendDailyBossFormationRankItem(this._bossType)
    }

    protected updateChallengeBtn():void {
        const context = DailyBossModel.ins().context;
        this.view.btnChallenge.labelCount
        .setVar("restCount", context.getRestChallengeTimes().toString())
        .setVar("maxCount", `${context.getTotalChallengeTimes()}`)
        .flushVars();

       
        let useTimes = context.bossInfoVo.todayGetAdvertTimes
        let remianTimes = GIns.adModel.getRemainAdTimes(useTimes, ServerEnums.AdvertType.DAILY_BOSS)
        if (remianTimes > 0) {
            let totalTimes = GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.DAILY_BOSS)
            this.view.btnPlayAd.visible = true
            this.view.btnPlayAd.title = `免费挑战次数${remianTimes}/${totalTimes}`
        } else {
            this.view.btnPlayAd.visible = false
        }
    }

    private updateRankPart() {
        const context = DailyBossModel.ins().context;

        const myRankNum = context.getMyRankNum();
        const isHaveRank = myRankNum > 0;
        this.view.myRankComp.getController("isHaveIn").selectedIndex = isHaveRank ? 1 : 0;

        if (isHaveRank) {
            this.view.myRankComp.labelRankNum
                .setVar("rankNum", myRankNum.toString())
                .flushVars();
        }


    }


    private onClickChallenge0() {
        DailyBossController.ins().challengeBoss()
    }


    private onClickSetUp0() {
        // 每日boss 阵容
        DailyBossController.ins().setUpFormation()
    }

    protected onClickPlayAd():void {
        let args:IAdPlayVo = {
            type:ServerEnums.AdvertType.DAILY_BOSS
        }
        this.emit(NotificationKey.AD_START_PLAY, args)
    }
}

UIScriptManager.bindScript(DailyBossUIKeys.DailyBossMainView, DailyBossMainView);