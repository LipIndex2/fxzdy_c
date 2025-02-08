import * as fgui from "fairygui-cc";
import { MallData } from "../../../mall/model/MallModel";
import { VipAdditionDesc, VipAdditionDescType } from "../../model/VipModel";
import { Tween } from "cc";
import { tween } from "cc";


/** vip特权item */
export class VipAdditionItem extends fgui.GComponent {
    static pkgName: string = "vip";
    static viewName: string = "VipAdditionItem";

    protected _mallData: MallData = null
    protected _firstRewardId: number = 0
    protected _rewards: { k: any, v: any }[] = []

    private get view(): ui.vip.item.VipAdditionItem {
        return this as any;
    }

    protected onInit() {
    }

    public clearAllIcon(): void {
        this.view.iconNew.visible = false
        this.view.iconOld.visible = false
        this.view.iconRaise.visible = false
    }

    public showIconByType(type: number): void {
        this.clearAllIcon()
        switch (type) {
            case VipAdditionDescType.New:
                this.view.iconNew.visible = true
                break
            case VipAdditionDescType.Raise:
                this.view.iconRaise.visible = true
                break
            case VipAdditionDescType.Old:
                this.view.iconOld.visible = true
                break
        }
    }

    protected onPreDispose():void {
        Tween.stopAllByTarget(this.view)
    }

    public setData(data: VipAdditionDesc): void {
        this.clearAllIcon()
        this.showIconByType(data.type)

        this.view.lbDes.text = data.desc
    }

    public showEffect(delay: number): void {
        Tween.stopAllByTarget(this.view)
        this.view.visible = false
        tween(this.view).delay(delay).call(() => {
            if (this.view?.node?.isValid) {
                this.view.visible = true
                this.view.alpha = 0
            }
        }).to(0.3, { alpha: 1 }).start()
    }
}