import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { redDotTrigger } from "../common/redDot/RedDotManager";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { LeagueManager } from "./leagueManager";
import { LeagueModel } from "./LeagueModel";
import { ILeagueGiftVo } from "./vo/ILeagueGiftVo";


export class leagueRedDotCtr extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_LEAGUE_apply_LIST,
            NotificationKey.EVENT_LEAGUE_INFO_CHANGE,
            NotificationKey.EVENT_LEAGUE_CHALLENGE_INFO_UPDATE,
            NotificationKey.EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE,
            NotificationKey.EVENT_LEAGUE_GIFT_CHANGE,
            NotificationKey.EVENT_LEAGUE_SENDd_GIFT_CHANGE,
            NotificationKey.EVENT_EXIT_LEAGUE,
            NotificationKey.EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE,
            NotificationKey.EVENT_LEAGUE_BOSS_INFO_CHANGE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.LEAGUE_BARGAIN_UPDATE,
        ];
    }


    notificationHandler(event: string, args?: any): void {

        switch (event) {
            case NotificationKey.EVENT_LEAGUE_apply_LIST:
                this.checkApplyRedDot();
                break;
            case NotificationKey.EVENT_LEAGUE_INFO_CHANGE:
            case NotificationKey.EVENT_EXIT_LEAGUE:
            case NotificationKey.SYSTEM_NEW_DAY:
                this.checkLeagueTaskRedDot();
                this.checkLeagueBoxTaskRedDot();
                this.checkLeagueBoxGiftRedDot();
                this.checkLeagueBoxNewGiftRedDot();
                this.checkLeagueBossRedDot();
                this.checkLeagueTechRedDot();
                this.checkBargainRedDot();
                this.checkLeagueBossAdRedDot();
                break;
            case NotificationKey.EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE:
                this.checkLeagueBoxTaskRedDot();
                break;
            case NotificationKey.EVENT_LEAGUE_GIFT_CHANGE:
                this.checkLeagueBoxGiftRedDot();
                break;
            case NotificationKey.EVENT_LEAGUE_SENDd_GIFT_CHANGE:
                this.checkLeagueBoxNewGiftRedDot();
                break;
            case NotificationKey.EVENT_LEAGUE_CHALLENGE_INFO_UPDATE:
                this.checkLeagueTaskRedDot();
                break;
            case NotificationKey.EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE:
            case NotificationKey.EVENT_LEAGUE_BOSS_INFO_CHANGE:
                this.checkLeagueBossRedDot();
                this.checkLeagueBossAdRedDot();
                break;
            case NotificationKey.LEAGUE_BARGAIN_UPDATE:
                this.checkBargainRedDot();
                break;
        }
    }

    @redDotTrigger(RedDotKeys.League_apply)
    checkApplyRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE, false))
            return false;
        if (!LeagueManager.ins().mPlayerLeagueLoginVo.leagueId)
            return false;
        //职权玩家，申请列表有未处理条目时
        //判断职权
        let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
        let applyPlayers = LeagueManager.ins().applyPlayers;
        let hasPermission = LeagueModel.ins().hasPermission(loginVo.jobType, ServerEnums.LeaguePermissionType.APPLY_APPROVAL);

        return hasPermission && applyPlayers.length > 0;
    }

    @redDotTrigger(RedDotKeys.League_challenge)
    checkLeagueTaskRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE, false))
            return false;
        if (!LeagueManager.ins().mPlayerLeagueLoginVo.leagueId)
            return false;
        //联盟挑战红点
        //已完成可领取
        let taskList = LeagueModel.ins().getLeagueTaskCfg()[0];

        return taskList.length > 0;
    }

    //联盟宝箱_任务
    @redDotTrigger(RedDotKeys.League_box_TabTask)
    checkLeagueBoxTaskRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOX, false))
            return false;
        if (!LeagueManager.ins().mPlayerLeagueLoginVo.leagueId)
            return false;
        //联盟宝箱_任务
        let taskList = LeagueManager.ins().getSortedLeagueWeeklyTaskList();
        return taskList[0].length > 0;
    }

    /**联盟宝箱，领取赠礼 */
    @redDotTrigger(RedDotKeys.League_Box_giftList)
    checkLeagueBoxGiftRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOX, false))
            return false;
        if (!LeagueManager.ins().mPlayerLeagueLoginVo.leagueId)
            return false;
        //联盟宝箱，领取赠礼
        let list = LeagueModel.ins().getLeagueGiftList();
        return list.length > 0;
    }

    newGiftItem: ILeagueGiftVo[] = [];
    /**联盟宝箱 有新的赠礼道具 */
    @redDotTrigger(RedDotKeys.League_Box_sendGiftBtn)
    checkLeagueBoxNewGiftRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOX, false))
            return false;
        if (!LeagueManager.ins().mPlayerLeagueLoginVo.leagueId)
            return false;
        //联盟宝箱 有新的赠礼道具
        let list = LeagueModel.ins().getSendGiftList();
        return this.newGiftItem.length > 0 && list.length > 0;
    }
    @redDotTrigger(RedDotKeys.leagueBoss_challenge)
    checkLeagueBossRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOSS, false))
            return false;
        let time = LeagueManager.ins().mPlayerLeagueLoginVo.bossChallengeTimes;
        //今日挑战次数为0时
        if (time == 0) {
            let stageVo = LeagueManager.ins().leagueBossStageInfo;
            let stage = stageVo?.bossStage;
            let cfgs = LeagueModel.ins().getLeagueBossConfigInStage(stage);
            let hasBoss: boolean = false;
            if (cfgs) {
                for (let i = 0; i < cfgs.length; i++) {
                    let state = LeagueModel.ins().getLeagueBossState(cfgs[i].id)
                    if (state == 1) {
                        hasBoss = true
                        break
                    }
                }
            }
            return hasBoss;
        }

        // let stageVo = LeagueManager.ins().leagueBossStageInfo;
        // if (stageVo) {
        //     let stage = stageVo.bossStage;
        //     let cfgs = LeagueModel.ins().getLeagueBossConfigInStage(stage);

        //     //联盟BOSS红点
        //     //登录时，今日联盟BOSS未挑战或无伤害
        //     let bossMaxHurtMap = LeagueManager.ins().mPlayerLeagueLoginVo.bossMaxHurtMap;
        //     for (let i = 0; i < cfgs.length; i++) {

        //         if (!bossMaxHurtMap[cfgs[i].id]) {
        //             return true
        //         }


        //     }


        // }

        return false

    }

    @redDotTrigger(RedDotKeys.leagueBoss_ad)
    checkLeagueBossAdRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOSS, false))
            return false;
        if (!LeagueManager.ins().mPlayerLeagueLoginVo.leagueId)
            return false;
        let remianTimes = GIns.adModel.getRemainAdTimes(GIns.LeagueManager.mPlayerLeagueLoginVo.bossAdvertChallengeTimes, ServerEnums.AdvertType.LEAGUE_BOSS);
        return remianTimes > 0;
    }

    isOpenTeckView = false;
    //每次登录时，材料满足科技一次升级时
    //点击进入该界面后，本次登录红点消失
    @redDotTrigger(RedDotKeys.League_tech)
    checkLeagueTechRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_TECH, false))
            return false;
        if (this.isOpenTeckView) return false;
        let careerList = LeagueManager.ins().mCareerList;
        let hasLvUp = false;
        for (let i = 0; i < careerList.length; i++) {
            let career = careerList[i];
            //8个孔位
            for (let j = 1; j <= 8; j++) {

                let state = LeagueModel.ins().getSlotState(career, j);
                if (state == 0 || state == 4) {
                    //看看材料是否满足升级条件
                    let curCfg = LeagueModel.ins().getLeagueTechCfg(career, j);
                    if (!curCfg) {
                        curCfg = LeagueModel.ins().getLeagueTechCfg(career, j, 1);
                    }

                    let level = curCfg.level;
                    let nextCfg = LeagueModel.ins().getLeagueTechCfg(career, j, level + 1);
                    if (nextCfg) {
                        //升级消耗
                        let cost = nextCfg.costItems[0];
                        let noOwnerItem = NoOwnerItem.createByConfigKv(cost);
                        const isCanPay = noOwnerItem.isCanPay();
                        if (isCanPay) {
                            hasLvUp = true;
                            return true;
                        }
                    }

                }
            }
        }

        return hasLvUp;
    }

    @redDotTrigger(RedDotKeys.leagueBargain_kill)
    checkBargainRedDot(): boolean {
        if (!ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE, false))
            return false;
        if (GIns.LeagueModel.getLeagueId() <= 0) {
            return false;
        }
        let context = GIns.LeagueModel.bargainContext;
        return context.data && context.isOpen() && context.isHaveKill() == false;
    }

    /** */

    onInit(): void {

    }

}

leagueRedDotCtr.ins().doInit();