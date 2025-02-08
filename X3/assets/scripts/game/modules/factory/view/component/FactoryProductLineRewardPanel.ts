import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";

/**
 * 星际工厂生产线奖励
 */
@bindFguiExtension('ui://factory/FactoryProductLineRewardPanel')
export class FactoryProductLineRewardPanel extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryProductLineRewardPanel";

    protected _rewards: { k: number, v: number }[] = []
    private get view(): ui.factory.component.FactoryProductLineRewardPanel {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.reset(this._rewards[index].k, 0, false)
    }

    public updateRewards(rewards: { k: number, v: number }[]): void {
        this._rewards = rewards
        this.view.listReward.numItems = this._rewards?.length
        // this.view.listReward.resizeToFit()
        // this.view.height = this.view.listReward.y + this.view.listReward.height
    }
}