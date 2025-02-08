import { math } from "cc";
import G from "../../../../core/comm/G";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { clamp } from "cc";

export class ActivityDiamondBankVo extends BaseActivityVo {
    /**活动对应的vo数据  */
    public get activityVo() {
        return this.content as Vo.activity.DiamondBankVo;
    }

    public updateRewardAdditional(additional: Vo.activity.DiamondBankVo): void {
        this.updateInfo(additional);
    }

    /**
     * 本地计算最新的累计星钻
     */
    public calculateCurDiamondNum() {
        let periodCount = Math.floor((G.TimeManager.serverNow - this.activityVo.startTime) / GIns.diamondBankCtr.producePeriod)
        let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this.activityId)
        let diamondNum = clamp(Math.floor(actCfg.diamondNum * periodCount), 0, actCfg.maxDiamondNum)
        return diamondNum
    }

    // /**
    //  * 活动入口是否展示
    //  * @returns 
    //  */
    // public isShowEntrance(): boolean {
    //     return !this.isDone() && super.isShowEntrance()
    // }

    public onInitDone(): void {
        G.FacadeManager.emit(NotificationKey.DIAMOND_BANK_ON_INIT_END)
    }
}