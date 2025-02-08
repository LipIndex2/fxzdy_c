import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";

@bindFguiExtension('ui://collectiblesDungeon/CollectiblesDungeonRewardTipView')
export class CollectiblesDungeonRewardTipView extends fgui.GComponent {

    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonRewardTipView";

    protected _star: number = 0;
    protected _rewards: { k: any, v: any }[] = null;

    private get view(): ui.collectiblesDungeon.view.CollectiblesDungeonRewardTipView {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.bg.onClick(this.onClickBg, this);
        this.view.rewardTip.listReward.itemRenderer = this.itemRendererForReward.bind(this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForReward(index: number, item: ui.collectiblesDungeon.item.CollectiblesDungeonRewardItem): void {
        let itemFrameBtn = FguiScriptUtils.toMyScriptClass(item.itemFrameBtn, ItemFrameBtn);
        itemFrameBtn.resetByConfigKv(this._rewards[index]);
    }

    protected onClickBg(): void {
        this.view.visible = false;
    }

    public showReward(target: fgui.GComponent, rewards: { k: any, v: any }[]): void {
        if (!target || !rewards) {
            return;
        }
        this.view.visible = true;
        //显示奖励
        this._rewards = rewards ? rewards : [];
        this.view.rewardTip.listReward.numItems = this._rewards.length;
        this.view.rewardTip.listReward.resizeToFit();

        //更新位置
        let showPos = target.localToGlobal(target.width * 0.5, 10);
        showPos = this.view.globalToLocal(showPos.x, showPos.y);
        this.view.rewardTip.x = showPos.x + 48;
        this.view.rewardTip.y = showPos.y;
    }
}