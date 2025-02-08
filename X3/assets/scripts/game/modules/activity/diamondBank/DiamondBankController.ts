import { math } from "cc";
import G from "../../../../core/comm/G";
import { Logger } from "../../../../core/log/Logger";
import { BaseController } from "../../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ActivityDiamondBankVo } from "../model/ActivityDiamondBankVo";

export class DiamondBankController extends BaseController {
    private _activityId: number

    listenNotifications(): string[] {
        return [
            NotificationKey.DIAMOND_BANK_ON_INIT_END,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE2,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.DIAMOND_BANK_ON_INIT_END: {
                let vo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
                if (vo) {
                    this._activityId = vo.activityId
                    this.calRed()
                }
                break;
            }
            case NotificationKey.ACTIVITY_UPDATE:
                if (args == this._activityId) {
                    this.calRed()
                }
            case NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE2: {
                this.calRed()
                break
            }
        }
    }

    /**多少毫秒产出一次钻石*/
    get producePeriod() {
        return 60 * 1000
    }


    /**
     * 距离下次产出星钻还有多少毫秒
     * @returns 返回毫秒数
     */
    productionRemaionTime() {
        let vo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
        let delay = Number.MAX_SAFE_INTEGER
        if (vo && vo.isShowEntrance()) {
            let deviation = 1000 //加个误差
            delay = Math.max((G.TimeManager.serverNow - deviation - vo.activityVo.startTime), 0) % this.producePeriod
            delay = this.producePeriod - delay
        }
        return delay;
    }

    /**
     * 距离星钻生产满还有多少毫秒
     * @returns 返回毫秒数, 0表示已经生产满了
     */
    fullProductionRemaionTime() {
        let vo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
        let delay = 0;
        if (vo && vo.isShowEntrance() && this._activityId) {
            let curDiamondNum = vo.calculateCurDiamondNum();
            let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._activityId);
            let remainTime = Math.ceil((actCfg.maxDiamondNum - curDiamondNum) / actCfg.diamondNum) * 60 * 1000;
            return remainTime;
        }
        return delay;
    }

    /**是否有可领取的星钻*/
    // hasDiamondToDraw() {
    //     let vo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
    //     if (vo) {
    //         return vo.activityVo.diamondNum > 0;
    //     }
    //     return false;
    // }

    //是否解锁了星钻，购买礼包，达到指定管卡都算
    private calRed() {
        let vo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
        if (!vo) return
        // if (vo.activityVo.boughtUnlock == false) {
        //     let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._activityId);
        //     let condition = GIns.conditionMgr.checkCondition(actCfg.conditions);
        //     if (condition == false) {
        //         Logger.debug("未解锁星钻");
        //         return
        //     }
        // }

        this.calculateRed()
        this.scheduleDiamondProduction()
    }

    private calculateRed() {
        let vo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
        let red = false, redLockReward = false;
        if (vo && this._activityId) {
            let actData = vo.activityVo;
            let cfg= G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._activityId);
            //星钻红点改成当星钻储蓄进度条充满后，领取按钮处与外部入口处需要奖励红点
            if (actData.diamondNum >= cfg.maxDiamondNum) {
                redLockReward = true;
                if (actData.boughtUnlock) {
                    //已购买解锁，可领取奖励
                    red = true;
                } else {
                    //满足解锁条件的话，可领取奖励
                    let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, vo.activityId);
                    red = GIns.conditionMgr.checkCondition(actCfg.conditions);
                }
            }
        }
        Logger.debug("星钻红点", red, redLockReward);
        GIns.redDotMgr.setRedDot(RedDotKeys.DIAMOND_BANK_WEAK_TIP, redLockReward);
        GIns.redDotMgr.setRedDot(RedDotKeys.DIAMOND_BANK_REWARD, red);
        GIns.redDotMgr.setRedDot(RedDotKeys.DIAMOND_BANK_LOCK_REWARD, redLockReward);
        
    }

    //玩家没有可领钻石的情况下，到时间后请求玩家新生产的钻石
    private scheduleDiamondProduction() {
        let vo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
        if (vo) {
            let red = GIns.redDotMgr.isHaveRedDot(RedDotKeys.DIAMOND_BANK_REWARD);
            if (!red) {
                let delay = this.fullProductionRemaionTime();
                Logger.debug("星钻定时请求产出数据", delay);
                if (delay > 0) {
                    G.GameTimer.once(delay, this, this.productionReq);
                }
            }
        }
    }

    private productionReq() {
        if (GIns.accountModel.isOnline) {
            let vo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DIAMOND_BANK);
            if (vo && vo.isShowEntrance()) {
                GIns.activityModel.sendActivity(this._activityId);
            } else {
                GIns.redDotMgr.setRedDot(RedDotKeys.DIAMOND_BANK_REWARD, false);
            }
        }
    }
}

DiamondBankController.ins().doInit();