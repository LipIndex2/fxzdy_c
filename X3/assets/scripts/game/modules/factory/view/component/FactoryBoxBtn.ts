import { Color } from "cc";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";

/**
 * 星际工厂战队技能
 */
@bindFguiExtension('ui://factory/FactoryBoxBtn')
export class FactoryBoxBtn extends fgui.GButton {

    static pkgName: string = "factory";
    static viewName: string = "FactoryBoxBtn";

    protected _grayColor: Color = new Color('#666666')

    private get view(): ui.factory.component.FactoryBoxBtn {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.setBoxState(0)
        this.isOpen(false)
    }

    protected onPreDispose(): void {

    }

    public setQuaiity(quality: number): void {
        let qualityCtrl = this.view.getController('quality')
        if (quality > qualityCtrl.pageCount) {
            quality = qualityCtrl.pageCount
        } else if (quality <= 0) {
            quality = 1
        }
        qualityCtrl.selectedIndex = quality - 1
    }

    public isOpen(bool: boolean): void {
        let isOpen = this.view.getController('isOpen')
        // isOpen.selectedIndex = bool ? 1 : 0
        isOpen.selectedIndex = bool ? 0 : 0
    }

    /**宝箱状态 0占领中 1空闲 2未解锁*/
    public setBoxState(state: number = 0): void {
        if (state == 0) {
            this.view.boxLoader.grayed = false
            this.view.boxLoader.color = this.view.boxOpenLoader.color = Color.WHITE
            this.view.iconLock.visible = false
        } else if (state == 1) {
            this.view.boxLoader.grayed = true
            this.view.boxLoader.color = this.view.boxOpenLoader.color = this._grayColor
            this.view.iconLock.visible = false
        } else if (state == 2) {
            this.view.boxLoader.grayed = true
            this.view.boxLoader.color = this.view.boxOpenLoader.color = this._grayColor
            this.view.iconLock.visible = true
        }
    }
}