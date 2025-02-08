import G from "../../../../core/comm/G";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";



/**累充vo */
export class ActivityTotalChargeVo extends BaseActivityVo {

    /** 所有累充配置（tab） */
    private _chargeCfgs: table.activity.TotalCharge.TotalChargeConfig[];

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.TotalChargeVo {
        return this.content as Vo.activity.TotalChargeVo;
    }

    /** 获取配置列表 */
    public get chargeCfgs(): table.activity.TotalCharge.TotalChargeConfig[] {
        if (!this._chargeCfgs) {
            let totalCfgs = G.TableManager.getAllData(table.activity.TotalCharge.TotalChargeConfig)
            this._chargeCfgs = totalCfgs.filter((value) => value.activityId == this.activityId)
        }
        return this._chargeCfgs;
    }

    /**更新奖励获取数据
     * @param rewardId 各个活动模块对应配置的奖励id
    */
    public updateRewardInfo(rewardId: number): void {
        this.activityVo.rewardIds.push(rewardId);
    }

    public isShowEntrance(): boolean {
        if (this.isActivityOver() || this.isDone() || this.hasDrawAll()) return false;
        return true;
    }

    /**是否已领取全部奖励*/
    public hasDrawAll(): boolean {
        let hasDrawAll = true
        for (let i = 0; i < this.chargeCfgs.length; i++) {
            let cfg = this.chargeCfgs[i]
            let hasDrawReward: boolean = this.activityVo.rewardIds.indexOf(cfg.id) != -1
            if (hasDrawReward == false) {
                hasDrawAll = false
                break
            }
        }
        return hasDrawAll
    }

    public isShowRed(): boolean {
        //写入对应活动的红点判断方法
        let hasRedDot: boolean = false
        for (let i = 0; i < this.chargeCfgs.length; i++) {
            let cfg = this.chargeCfgs[i]
            let hasDrawReward: boolean = this.activityVo.rewardIds.indexOf(cfg.id) != -1
            let curMoney = Math.min(cfg.chargeMoney, this.activityVo.money)
            if (hasDrawReward == false && curMoney >= cfg.chargeMoney) {
                //有可领取奖励
                hasRedDot = true
                break
            }
        }
        return hasRedDot;
    }

}