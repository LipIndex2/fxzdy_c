import * as fgui from "fairygui-cc";
import {GMView} from "db://assets/scripts/gm/view/GMView";

/**
 * GM 物品 View
 */
export class ButtonGmTypeView extends fgui.GButton {

    // 父级 GM View
    private _gmView: GMView;
    // 绑定点击
    private _onBtnTypeClick: Function;
    // 第几个 tab
    private _tabIndex: number;

    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "ButtonGmTypeView";

    // endregion


    private get view(): ui.gm.ButtonGmTypeView {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit()
    }


    public onInit() {

        this.view.on(fgui.Event.TOUCH_END, this.onTouchEnd0, this);
    }


    onRenderCallback(title: string) {
        this.view.laelTitle.text = title
    }

    setChoose(choose: boolean) {
        if (choose) {
            // this.view.getController("button").selectedIndex = 1
        } else {
            // this.view.getController("button").selectedIndex = 0
        }
    }

    bindClickCallback(callback: () => void) {
        this._onBtnTypeClick = callback;
    }

    private onTouchEnd0() {
        this._gmView.updateChooseTabIndex(this._tabIndex)

        if (this._onBtnTypeClick) {
            this._onBtnTypeClick();
        }
    }

    bindGmView(param: GMView, index: number) {
        this._gmView = param;
        this._tabIndex = index;
    }
}