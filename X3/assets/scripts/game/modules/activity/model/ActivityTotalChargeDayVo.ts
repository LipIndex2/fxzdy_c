import G from "../../../../core/comm/G";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";



/**累天充值vo */
export class ActivityTotalChargeDayVo extends BaseActivityVo {

    /** 所有累充配置（tab） */
    private _chargeCfgs: table.activity.TotalChargeDay.TotalChargeDayConfig[];

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.TotalChargeDayVo {
        return this.content as Vo.activity.TotalChargeDayVo;
    }

    /** 获取配置列表 */
    public get chargeCfgs(): table.activity.TotalChargeDay.TotalChargeDayConfig[] {
        if (!this._chargeCfgs) {
            let totalCfgs = G.TableManager.getAllData(table.activity.TotalChargeDay.TotalChargeDayConfig)
            this._chargeCfgs = totalCfgs.filter((value) => value.activityId == this.activityId)
            this._chargeCfgs.sort((a, b) => { return a.chargeDay - b.chargeDay })
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
        let hasDrawAll = true,
            len = this.chargeCfgs.length,
            rewardIds = this.activityVo.rewardIds
        for (let i = 0; i < len; i++) {
            let cfg = this.chargeCfgs[i]
            let hasDrawReward: boolean = rewardIds.indexOf(cfg.id) != -1
            if (hasDrawReward == false) {
                hasDrawAll = false
                break
            }
        }
        return hasDrawAll
    }

    public isShowRed(): boolean {
        //写入对应活动的红点判断方法
        let {chargeDay, rewardIds} = this.activityVo
        let len = this.chargeCfgs.length
        for(let i = 0; i < len; i++){
            let cfg = this.chargeCfgs[i]
            if (cfg.chargeDay > chargeDay) break
            if(rewardIds.indexOf(cfg.id) == -1) {
                return true
            }
        }
        return false
    }

}