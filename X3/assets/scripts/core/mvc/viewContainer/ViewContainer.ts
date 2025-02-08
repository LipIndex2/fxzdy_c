import UIScriptManager from "../../comm/UIScriptManager";
import { UIManager } from "../UIManager";
import { UIView } from "../view/UIView";
import { IContainer } from "./IContainer";
import * as fgui from "fairygui-cc";
import { IMainContainerPageOpenArgs } from "db://assets/scripts/game/ui/main/structs/IMainContainerPageOpenArgs";
import ArrayUtils from "../../utils/ArrayUtils";

/**界面容器 实现多页签界面 */
export default class ViewContainer extends fgui.GComponent {
    /** 界面关键字组 */
    private _uiKeyArr: Array<string> = [];
    /** 按钮组 */
    private _items: Array<fgui.GComponent> = [];
    /**拥有者 */
    private _owner: IContainer;
    /**是否正在打开UI */
    private _isOpening: boolean = false;

    /**当前选择索引 */
    private _selectIndex: number = -1;

    /**拥有者 */
    setOwner(uiView: IContainer) {
        this._owner = uiView;
    }

    /**
     * tab页页面显示的容器
     * @param uids uid数组
     * @param btns 按钮
     */
    bindByBtns(uiKeys: Array<string>, btns: Array<fgui.GComponent>) {
        let count: number = Math.min(uiKeys.length, btns.length);
        this._items = btns.slice();
        this.setUiKeyArr(uiKeys);
        for (let i = 0; i < count; ++i) {
            btns[i].onClick(this.onTabClick.bind(this, i), this);
        }
    }

    setUiKeyArr(uiKeys: Array<string>) {
        if (ArrayUtils.equal(this._uiKeyArr, uiKeys)) {
            return;
        }
        if (this._uiKeyArr?.length) {
            this.closeOldView(uiKeys);
        }

        this._uiKeyArr = uiKeys.slice();
    }

    /**
     * 如果你的按钮是放到GList中的，则可以通过指定GList作为页签的按钮组 （暂不支持虚列表）
     * @param uids
     * @param btnList
     */
    bindByGList(uiKeys: Array<string>, btnList: fgui.GList): void {
        let count = btnList.numItems;
        let btn = new Array(count);
        for (let i = 0; i < count; ++i) {
            btn[i] = btnList.getChildAt(i);
        }
        this.bindByBtns(uiKeys, btn);
    }

    /**当前页签下标 */
    public get selectIndex(): number {
        return this._selectIndex;
    }

    /**
     * 选择索引
     */
    public set selectIndex(index: number) {
        if (!this._uiKeyArr?.length) {
            console.error("未绑定界面！！");
            return;
        }

        if (this._selectIndex === index || this._isOpening) {
            return;
        }
        this.forceOpen(index);
    }
    /**
     * 某些需求要强行从新打开界面
     * @param index
     */
    forceOpen(index: number): void {
        this._isOpening = true;
        this.setTabState(index);
        let beforeIndex: number = this._selectIndex;
        this._selectIndex = index;
        //if (this._onChangeHandler) this._onChangeHandler(index);

        // 预处理切换子界面对应的参数
        let args = this._owner.onPreChangeView && this._owner.onPreChangeView(index);
        this.openView(index, beforeIndex, args);
    }

    /**
     * 检查给定索引处的视图键是否与之前的视图键相同。
     * @param index - 要检查的视图的索引。
     * @param beforeViewKey - 之前的视图键。
     * @returns 如果索引处的视图键与之前的视图键相同，则返回 true，否则返回 false。
     */
    checkSameIndex(index: number, beforeViewKey: string): boolean {
        let uiKey = this.getUiKey(index);
        if (uiKey === beforeViewKey) {
            return true;
        }
        return false;
    }

    /** 获取对应索引的页面名 */
    // public getUiKey(index: number): string {
    //     return this._uiKeyArr[index];
    // }

    /**打开界面 */
    private openView(index: number, beforeIndex: number, args?: object, isReopen = false) {
        let uiKey = this.getUiKey(index);

        let uiView = UIManager.ins().getViewInstance(uiKey);
        if (uiView) {
            //@ts-ignore
            uiView.doClose(true);
            uiView._view.visible = true;
            //@ts-ignore
            uiView.doOpen(args, isReopen);
            this._isOpening = false;

            if (beforeIndex >= 0) {
                this.onSwitchedView(index, beforeIndex);
            }
        } else {
            this._isOpening = true;
            UIManager.ins().openSubview(this, uiKey, args, () => {
                this._isOpening = false;
                if (beforeIndex >= 0) {
                    this.onSwitchedView(index, beforeIndex);
                }
            });
        }
    }

    protected getUiKey(index: number): string {
        return this._uiKeyArr[index];
    }

    /**界面切换完成 */
    private onSwitchedView(index: number, beforeIndex: number) {
        let beforeUIKey = this.getUiKey(beforeIndex);
        if (beforeUIKey && beforeUIKey != this.getUiKey(index)) {
            let uiView = UIManager.ins().getViewInstance(beforeUIKey);
            if (uiView) {
                uiView._view.visible = false;
                //@ts-ignore
                uiView.doClose(true);
                //UIManager.ins().close(beforeUIKey);
            }
        }

        this._owner.onChangedView && this._owner.onChangedView(index);
    }

    /**点击页签 */
    private onTabClick(index: number, evt: fgui.Event): void {
        if (this._selectIndex === index) {
            this.setBtnState(this._items[this._selectIndex], true);
            return;
        }

        if (this._owner.onClickTabAndCheck && !this._owner.onClickTabAndCheck(index)) {
            if (index !== -1) {
                this.setBtnState(this._items[index], false);
                this.setBtnState(this._items[this._selectIndex], true);
            }
            return;
        }

        this.selectIndex = index;
    }

    /**设置下标状态 */
    private setTabState(curIdx: number): void {
        if (this._selectIndex !== -1) {
            this.setBtnState(this._items[this._selectIndex], false);
        }
        this.setBtnState(this._items[curIdx], true);
    }

    /**转换按钮状态 */
    private setBtnState(btn: fgui.GComponent, select: boolean) {
        if (btn instanceof fgui.GButton) {
            btn.selected = select;
            let controller: fgui.Controller = btn.getControllerAt(0);
            if (controller) {
                controller.selectedIndex = select ? 1 : 0;
                btn.applyController(controller);
            }
        }
    }

    /**界面打开 */
    onOpen(isReopen = false) {
        if (!this._uiKeyArr?.length) return;

        if (this._selectIndex >= 0 && this.getUiKey(this._selectIndex)) {
            let uiView = UIManager.ins().getViewInstance(this.getUiKey(this._selectIndex));
            if (uiView && !uiView.isOpened) {
                //重新打开保留场景
                let args = this._owner.onPreChangeView && this._owner.onPreChangeView(this._selectIndex);
                this.openView(this._selectIndex, -1, args, isReopen);
            }
        }
    }

    /**关闭界面 */
    onClose(dontDispose: boolean) {
        if (!this._uiKeyArr?.length) return;

        for (let i = 0; i < this._uiKeyArr.length; i++) {
            let uiKey = this.getUiKey(i);
            if (dontDispose) {
                let uiView = UIManager.ins().getViewInstance(uiKey);
                if (uiView) {
                    //@ts-ignore
                    uiView.doClose(dontDispose);
                }
            } else {
                UIManager.ins().close(uiKey);
            }
        }

        if (!dontDispose) {
            this._uiKeyArr.length = 0;
        }
    }

    closeOldView(newUIkey: string[]) {
        if (!this._uiKeyArr?.length) return;
        let curUIkey = this._uiKeyArr[this._selectIndex];
        for (let i = 0; i < this._uiKeyArr.length; i++) {
            if (newUIkey.indexOf(this._uiKeyArr[i]) == -1) {
                UIManager.ins().close(this._uiKeyArr[i]);
            }
        }
        let index = newUIkey.indexOf(curUIkey);
        this._selectIndex = index;
    }
}
