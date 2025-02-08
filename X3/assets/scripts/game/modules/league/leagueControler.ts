import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { UIManager } from "../../../core/mvc/UIManager";
import { WeekDay } from "../../../core/time/WeekDay";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { FormationManager } from "../formation/FormationManager";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { EventRankDataResp } from "../rank/event/EventRankData";
import { UILeagueKey } from "./const/UILeagueConst";
import { LeagueManager } from "./leagueManager";
import { LeagueModel } from "./LeagueModel";
import { leagueRedDotCtr } from "./leagueRedDotCtr";
import { LeagueListView } from "./view/leagueListView";

export class LeagueControler extends BaseController {
    constructor() {
        super();
    }
    onInit(): void {
        //加入/创建联盟
        G.FGUIManager.bindScript("ui://league/leagueList", LeagueListView);
    }
    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.RANK_ON_DATA_RESP,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
            NotificationKey.EVENT_CHANGE_ITEMS2,
            NotificationKey.EVENT_HAVE_LEAGUE,
        ]
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.udpateMyLeagueRank();
                break;
            case NotificationKey.RANK_ON_DATA_RESP:
                let data = args as EventRankDataResp;
                if (data?.rankType == ServerEnums.RankingType.LEAGUE_FIGHT) {
                    LeagueManager.ins().addRankData(data);
                    //抛事件
                    G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_RANK_RESP, args);
                }
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                //检测当前服务器时间是否周一
                //  LeagueModel.ins().loadStageLeagueBoss();
                let humanWeekDayNum = WeekDay.getWeekDayByTimeMs(G.TimeManager.serverNow).getHumanWeekDayNum();
                if (humanWeekDayNum == 1) {
                    //周一
                    LeagueManager.ins().mPlayerLeagueLoginVo.drawLastWeekLeagueBox = false;
                }
                this.udpateMyLeagueRank();
                //跨天清空广告记录
                LeagueManager.ins().mPlayerLeagueLoginVo.bossAdvertChallengeTimes = 0;
                if (GIns.LeagueModel.getLeagueId() > 0) {
                    GIns.LeagueModel.loadStageLeagueBoss();
                }
                break;
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                if (args == FightType.LEAGUE_BOSS) {
                    //联盟boss保存完阵容直接进入挑战
                    let bossId = FormationManager.ins().getAutoFightParam(FightType.LEAGUE_BOSS)
                    if (bossId > 0) {
                        LeagueModel.ins().initBossHurt(bossId)
                        LeagueModel.ins().challengeLeagueBoss(bossId)
                        FormationManager.ins().deleteAutoFightParam(FightType.LEAGUE_BOSS)
                    }
                }
                break;
            case NotificationKey.EVENT_HAVE_LEAGUE:
                this.udpateMyLeagueRank();
                GIns.LeagueModel.loadStageLeagueBoss();
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS2:
                GIns.LeagueModel.addRewardsToLeaugeGift(args);
                break;
        }

    }

    /**刷新我的联盟排名*/
    udpateMyLeagueRank(): void {
        if (GIns.LeagueModel.getLeagueId() > 0) {
            GIns.LeagueModel.getLeagueRankList(1);
        }
    }


    openLeagueTech(): void {
        if (ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_TECH, true)) {
            leagueRedDotCtr.ins().isOpenTeckView = true;
            UIManager.ins().open(UILeagueKey.LeagueTechView);
            leagueRedDotCtr.ins().checkLeagueTechRedDot();
        }
    }

    openLeagueBoss(): void {
        if (ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOSS, true))
            UIManager.ins().open(UILeagueKey.LeagueBossView);
    }

    openNewStageView(stage: number): void {
        UIManager.ins().open(UILeagueKey.LeagueNewStageView, stage);
    }

    /**打开联盟宝箱主界面 */
    openLeagueBox(): void {
        if (ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOX, true)) {
            if (LeagueModel.ins().canOpenLeagueBoxWeekBox()) {
                //可领取奖励直接弹出宝箱领取界面
                this.openLeagueBoxReward();
            } else {
                UIManager.ins().open(UILeagueKey.LeagueBoxMainView);
            }
        }

    }
    /**打开联盟宝箱赠礼列表界面 */
    openLeagueGiftList(): void {

        UIManager.ins().open(UILeagueKey.LeagueBoxGiftListView);

    }

    /**打开联盟宝箱奖励界面 */
    openLeagueBoxReward(): void {
        UIManager.ins().open(UILeagueKey.LeagueBoxRewardView);
    }





}

LeagueControler.ins().doInit();
