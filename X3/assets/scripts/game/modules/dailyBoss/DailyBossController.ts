import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import {
    DailyBossBalanceGridComp
} from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossBalanceGridComp";
import { DailyBossDifficultyComp } from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossDifficultyComp";
import { DailyBossHotHeroComp } from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossHotHeroComp";
import { DailyBossOneRowComp } from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossOneRowComp";
import {
    DailyBossProgressRewardComp
} from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossProgressRewardComp";
import { DailyBossSkillItem } from "db://assets/scripts/game/modules/dailyBoss/skill/DailyBossSkillItem";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TimeManager } from "../../../core/time/TimeManager";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { FightType } from "../../comm/battle/enum/FightType";
import { BuyInLimitTodayConfirmViewOpenArgs } from "../common/confirm/BuyInLimitTodayConfirmView";
import { UICommonKey } from "../common/const/UICommonConfig";
import { FloatingTextManager } from "../floatingText/FloatingTextManager";
import { UIFormationKey, FormationMainViewOpenArgs } from "../formation/const/UIFormationConfig";
import { FormationManager } from "../formation/FormationManager";
import { ItemUtils } from "../item/utils/ItemUtils";
import { DailyBossConfigManager } from "./config/DailBossConfigManager";
import { DailiesI18nKeys } from "./DailyBossI18nKeys";
import { DailyBossModel } from "./model/DailyBossModel";
import { DailyBossUtils } from "./utils/DailyBossUtils";
import GIns from "../../GIns";

export class DailyBossController extends BaseController {

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.DAILY_BOSS_INFO_CHANGE,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.DAILY_BOSS, false)) {
                    return;
                }
                DailyBossModel.ins().sendLoadInfo();
                break;
            case NotificationKey.DAILY_BOSS_INFO_CHANGE:
                DailyBossModel.ins().sendLoadCurrentBossRank();
                break;
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                if (args == FightType.DAILY_BOSS) {
                    //每日boss保存完阵容直接进入挑战
                    let bossId = FormationManager.ins().getAutoFightParam(FightType.DAILY_BOSS)
                    if (bossId > 0) {
                        this.challengeBoss()
                        FormationManager.ins().deleteAutoFightParam(FightType.DAILY_BOSS)
                    }
                }
        }
    }

    constructor () {
        super();
    }

    onInit(): void {

        G.FGUIManager.bindScript("ui://dailyBoss/DailyBossProgressRewardComp", DailyBossProgressRewardComp);
        G.FGUIManager.bindScript("ui://dailyBoss/DailyBossHotHeroComp", DailyBossHotHeroComp);
        G.FGUIManager.bindScript("ui://dailyBoss/DailyBossDifficultyComp", DailyBossDifficultyComp);
        G.FGUIManager.bindScript("ui://dailyBoss/DailyBossOneRowComp", DailyBossOneRowComp);
        G.FGUIManager.bindScript("ui://dailyBoss/DailyBossSkillItem", DailyBossSkillItem);
        G.FGUIManager.bindScript("ui://dailyBoss/DailyBossBalanceGridComp", DailyBossBalanceGridComp);
    }

    /**开始挑战*/
    public challengeBoss(): void {
        // 挑战
        const restTimeMs = DailyBossUtils.getRestTimeMs(TimeManager.serverNow);
        if (restTimeMs <= DailyBossConfigManager.stopChallengeTimeMs) {
            GIns.floatingTextMgr.showTips(DailiesI18nKeys.notChallengeWhenBalance);
            return;
        }

        const context = DailyBossModel.ins().context;
        const bossConfig: table.dailyboss.DailyBossConfig = context.getCurrentBossConfig()
        if (!bossConfig) {
            return;
        }
        const bossType = bossConfig.bossType;
        const vo = FormationManager.ins().getFormationVoByType(FightType.DAILY_BOSS, 0, bossType.toString());
        if (vo?.isEmptyFormation()) {
            // 需要先布阵
            console.info("需要先布阵");
            this.setUpFormation();
            return;
        }

        const isCanFree = context.isCanChallengeByFree()
        if (isCanFree) {
            DailyBossModel.ins().sendChallengeBoss(false);
            return;
        }

        const todayBuyChallengeTimes = context.getTodayBuyChallengeTimes();
        const buyConfig = DailyBossConfigManager.getBuyChallengeConfigByCount(todayBuyChallengeTimes + 1);
        if (!buyConfig) {
            GIns.floatingTextMgr.showTips("今日挑战次数已达上限");
            return;
        }

        const costItem = ItemUtils.parseKvArrayToOnlyOneItem(buyConfig.costItems);
        // confirm buy
        G.UIManager.open(UICommonKey.BuyInLimitTodayConfirmView, BuyInLimitTodayConfirmViewOpenArgs.create(
            costItem,
            todayBuyChallengeTimes,
            DailyBossConfigManager.getMaxBuyChallengeTimes(),
            () => {
                DailyBossModel.ins().sendChallengeBoss(true);
            }
        ));
    }

    /**设置阵容*/
    public setUpFormation(posVos: Vo.formation.PositionVo[] = null): void {
        // 每日boss 阵容
        const context = DailyBossModel.ins().context;
        const bossConfig: table.dailyboss.DailyBossConfig = context.getCurrentBossConfig()
        if (!bossConfig) {
            return;
        }
        const bossType = bossConfig.bossType;
        FormationManager.ins().addAutoFightParam(FightType.DAILY_BOSS, bossConfig.id)
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
            FightType.DAILY_BOSS,
            bossType.toString(),
            posVos
        ));
    }

}

DailyBossController.ins().doInit();