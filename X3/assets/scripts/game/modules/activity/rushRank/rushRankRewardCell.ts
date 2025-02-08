import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import * as fgui from "fairygui-cc";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ActivityRushRankVo } from "../model/ActivityRushRankVo";

const { GObject } = fgui;

/**
 * 冲榜奖励item ItemFrame
 */
@bindFguiExtension('ui://rushRank/rushRankRewardCell')
export class rushRankRewardCell extends fgui.GButton {

    static pkgName: string = "rushRank";

    static viewName: string = "rushRankRewardCell";

    protected _limitId: number = 0;
    protected _rewards: { k: number, v: number }[] = [];
    private get view(): ui.rushRank.com.rushRankRewardCell {
        return this as any;
    }

    protected onInit() {
        this.view.rewardList.setVirtual();
        this.view.rewardList.itemRenderer = this.itemRendererForReward.bind(this);
    }

    protected itemRendererForReward(index: number, item: ui.comm.item.ItemFrameBtnWithLimit): void {
        if (this._limitId && this._rewards[index].k == this._limitId) {
            //显示限定标签
            item.iconLimit.visible = true;
        } else {
            item.iconLimit.visible = false;
        }
        FguiScriptUtils.toMyScriptClass(item.itemFrame, ItemFrameBtn).resetByConfigKv(this._rewards[index]);
    }

    setData(vo: ActivityRushRankVo, index: number, myRank: number): void {
        let cfg = vo.rushRankRewardCfgs[index];
        let min = cfg.minRank;
        this._limitId = cfg.Limit;
        let ctr = this.view.getController("state");
        let max = min;
        if (min < 4) {
            //前三名
            ctr.selectedIndex = min - 1;
        } else {
            let last = vo.rushRankRewardCfgs[index - 1];
            max = last.minRank + 1;
            ctr.selectedIndex = 3;
            this.view.rankTxt.text = max + "-" + min;
        }
        this._rewards = cfg.rewards ? cfg.rewards : [];
        this.view.rewardList.numItems = this._rewards.length;
        if (myRank > 0 && myRank >= max && myRank <= min) {
            this.view.getController("myRank").selectedIndex = 1;
        } else {
            this.view.getController("myRank").selectedIndex = 0;
        }
    }

    /**赛季 */
    setDataBySeason(cfgs: table.seasonactivity.SeasonRushRank.SeasonRushRankRewardConfig[], index: number, myRank: number): void {
        let cfg = cfgs[index];
        let min = cfg.minRank;
        let ctr = this.view.getController("state");
        let max = min;
        if (min < 4) {
            //前三名
            ctr.selectedIndex = min - 1;
        } else {
            let last = cfgs[index - 1];
            max = last.minRank + 1;
            ctr.selectedIndex = 3;
            this.view.rankTxt.text = max + "-" + min;
        }

        const scoreRewards = cfg.scoreRewards || [];
        this._rewards = cfg?.rewards ? cfg.rewards : [];
        this._rewards = this._rewards.concat(scoreRewards);

        this.view.rewardList.numItems = this._rewards.length;
        if (myRank > 0 && myRank >= max && myRank <= min) {
            this.view.getController("myRank").selectedIndex = 1;
        } else {
            this.view.getController("myRank").selectedIndex = 0;
        }
    }
}
