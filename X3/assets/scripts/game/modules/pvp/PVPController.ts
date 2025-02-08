import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import {
    PVPChallengeOtherOneRowComp
} from "db://assets/scripts/game/modules/pvp/components/PVPChallengeOtherOneRowComp";
import { PVPDailyRewardTipsComp } from "db://assets/scripts/game/modules/pvp/components/PVPDailyRewardTipsComp";
import { PVPRankBigLogoChooseComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankBigLogoChooseComp";
import { PVPRankBigLogoComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankBigLogoComp";
import { PVPRankScoreBar } from "db://assets/scripts/game/modules/pvp/components/PVPRankScoreBar";
import { PVPRankSettleTabComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankSettleTabComp";
import { PVPRankStarListComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankStarListComp";
import { PVPRecordOneRowComp } from "db://assets/scripts/game/modules/pvp/components/PVPRecordOneRowComp";
import { PVPTaskListItemComp } from "db://assets/scripts/game/modules/pvp/components/PVPTaskListItemComp";
import {
    PVPWeeklyChallengeRewardComp
} from "db://assets/scripts/game/modules/pvp/components/PVPWeeklyChallengeRewardComp";
import { PVPUIKeys } from "db://assets/scripts/game/modules/pvp/PVPUIKeys";
import { PVPRankLvUpViewOpenArgs } from "db://assets/scripts/game/modules/pvp/view/PVPRankLvUpView";

const { ccclass, property } = _decorator;

/**
 * 邮件控制器
 */
export class PVPController extends BaseController {
    /***战斗后记录的段位提升 */
    public battleToRankLvUpScore: number = 0;
    public battleToRankLvUpOldScore: number = 0;
    listenNotifications(): string[] {
        return [
            NotificationKey.PVP_RANK_LV_UP
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PVP_RANK_LV_UP:
                let tempArgs: { newScore: number, oldScore: number } = args
                this.battleToRankLvUpScore = tempArgs.newScore
                this.battleToRankLvUpOldScore = tempArgs.oldScore;
                break;
        }
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://pvp/PVPDailyRewardTipsComp", PVPDailyRewardTipsComp);
        G.FGUIManager.bindScript("ui://pvp/PVPRankBigLogoComp", PVPRankBigLogoComp);
        G.FGUIManager.bindScript("ui://pvp/PVPChallengeOtherOneRowComp", PVPChallengeOtherOneRowComp);
        G.FGUIManager.bindScript("ui://pvp/PVPRankStarListComp", PVPRankStarListComp);
        G.FGUIManager.bindScript("ui://pvp/PVPRecordOneRowComp", PVPRecordOneRowComp);
        G.FGUIManager.bindScript("ui://pvp/PVPRankScoreBar", PVPRankScoreBar);
        G.FGUIManager.bindScript("ui://pvp/PVPTaskListItemComp", PVPTaskListItemComp);
        G.FGUIManager.bindScript("ui://pvp/PVPWeeklyChallengeRewardComp", PVPWeeklyChallengeRewardComp);
        G.FGUIManager.bindScript("ui://pvp/PVPRankSettleTabComp", PVPRankSettleTabComp);
        G.FGUIManager.bindScript("ui://pvp/PVPRankBigLogoChooseComp", PVPRankBigLogoChooseComp);

    }

}

PVPController.ins().doInit();


