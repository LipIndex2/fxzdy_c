import { tween, Tween } from "cc";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import * as fgui from "fairygui-cc";
import { ItemFrameBtn } from "./ItemFrameBtn";

/**
 * 道具图标 ItemFrameExtra
 */
@bindFguiExtension('ui://comm/ItemFrameBtnWithExtra')
export class ItemFrameBtnWithExtra extends fgui.GButton {

    static pkgName: string = "comm";

    static viewName: string = "ItemFrameBtnWithExtra";

    private get view(): ui.comm.item.ItemFrameBtnWithExtra {
        return this as any;
    }

    protected onInit() {

    }

    /**
     * 设置道具数据
     * @param itemId 物品id
     * @param count 数量
     * @param isShowNum
     */
    reset(itemId: number, count: number, isShowNum: boolean = true) {
        let itemComp = FguiScriptUtils.toMyScriptClass(this.view.itemFrame, ItemFrameBtn);
        itemComp.reset(itemId, count, isShowNum);
    }

    resetByConfigKv(kv: { k: any; v: any }) {
        this.reset(kv.k, kv.v);
    }

    // 更新 by 无主物品
    resetByNoOwnerItem(noOwnerItem: NoOwnerItem, showCount: boolean = true) {
        this.reset(noOwnerItem.itemId, noOwnerItem.count, showCount);
    }

    /** 播放扫光动画 */
    public playAnim(force: boolean = false) {
        let itemComp = FguiScriptUtils.toMyScriptClass(this.view.itemFrame, ItemFrameBtn);
        itemComp.playAnim(force);
        Tween.stopAllByTarget(this.view.pExtra);
        if (this.view.pExtra.visible) {
            this.view.pExtra.alpha = 0;
            tween(this.view.pExtra)
                .delay(0.1)
                .to(0.2, { alpha: 1 })
                .start();
        }
    }

    public stopAnim() {
        Tween.stopAllByTarget(this.view.pExtra);
        let itemComp = FguiScriptUtils.toMyScriptClass(this.view.itemFrame, ItemFrameBtn);
        itemComp.stopAnim();
    }

    onPreDispose() {
        Tween.stopAllByTarget(this.view.pExtra);
    }
}
