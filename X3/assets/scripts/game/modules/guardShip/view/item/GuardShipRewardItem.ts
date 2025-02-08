import * as fgui from "fairygui-cc";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import GIns from "../../../../GIns";

@bindFguiExtension('ui://guardShip/GuardShipRewardItem')
export class GuardShipRewardItem extends fgui.GComponent {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipRewardItem";

    protected _rewards: { k: any, v: any }[] = []

    private get view(): ui.guardShip.item.GuardShipRewardItem {
        return this as any;
    }

    protected onInit(): void {
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.reset(this._rewards[index].k, this._rewards[index].v)
    }

    public setData(cfg: table.guardship.GuardShipRankConfig, lastCfg: table.guardship.GuardShipRankConfig): void {
        let minRank:number = lastCfg ? lastCfg.minRank + 1 : cfg.minRank
        let maxRank:number = cfg.minRank
        if (1 <= minRank && minRank <= 3) {
            this.view.getController("rank").selectedIndex = minRank - 1
        } else {
            this.view.getController("rank").selectedIndex = 3;
            if (minRank == maxRank) {
                this.view.lbRank.text = `${maxRank}`;
            } else {
                this.view.lbRank.text = `${minRank}-${maxRank}`;

            }
        }
        this._rewards = cfg.rewards
        this.view.listReward.numItems = this._rewards.length

        let myRank = GIns.guardShipModel.myRank
        this.view.getController('isMe').selectedIndex = myRank >= minRank && myRank <= maxRank ? 1 : 0
    }
}