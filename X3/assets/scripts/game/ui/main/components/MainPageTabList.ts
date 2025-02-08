import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { MainPageTabBtn } from "../item/MainPageTabBtn";

export enum MainPageTabListLayout {
    /**从左到右*/
    LEFT = 1,
    /**从右到左*/
    RIGHT = 2,
}

@bindFguiExtension("ui://main/MainPageTabList")
export class MainPageTabList extends fgui.GComponent {
    protected _layout: MainPageTabListLayout = MainPageTabListLayout.LEFT;
    /** 最大行数 */
    protected _maxRow: number = 4;
    /** 展示隐藏按钮最少需要的数量 */
    protected _showFoldCnt: number = 5;
    /**横向间隔*/
    protected _lineGap: number = 0;
    /**纵向间隔*/
    protected _colGap: number = 0;
    /**是否折叠*/
    protected _isInFold: boolean = false;
    /**item列表*/
    protected _items: MainPageTabBtn[] = [];

    protected _cfgDatas: table.mainpage.MainPageTabItemConfig[] = [];

    private get view(): ui.main.components.MainPageTabList {
        return this as any;
    }


    protected onInit(): void {
        this.view["__isInList"] = true;
        this.view.btnFold.visible = false;
        this.view.btnFold.onClick(this.onClickFold, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickFold(): void {
        if (this._isInFold) {
            this._isInFold = false;
            this.view.btnFold.rotation = 0;
            this.refreshUI();
        } else {
            this._isInFold = true;
            this.view.btnFold.rotation = 180;
            this.refreshUI();
        }
    }

    protected refreshUI(): void {
        if (this._cfgDatas.length > 0) {
            this.updateUIByCfgs(this._cfgDatas, true);
        }
    }

    /**初始化列表配置*/
    public initUIConfig(layout: MainPageTabListLayout, maxRow: number = 4, showFoldCnt: number, lineGap: number = 0, colGap: number = 0): void {
        this._layout = layout;
        this._maxRow = maxRow;
        this._showFoldCnt = showFoldCnt;
        this._lineGap = lineGap;
        this._colGap = colGap;
        if (this._maxRow <= 0) {
            console.error('列表最大行数不可小于0');
            return;
        }
        this.refreshUI();
    }

    public updateUIByCfgs(cfgs: table.mainpage.MainPageTabItemConfig[], fromRefreshUI: boolean = false): void {
        this._cfgDatas = cfgs;
        let len = Math.max(cfgs.length, this._items.length);
        let lastItem: MainPageTabBtn = null;
        let showIdx: number = 0;
        for (let i = 0; i < len; i++) {
            if (i < cfgs.length && (cfgs[i].isShowInFold || this._isInFold == false)) {
                //需要显示的
                let item = null;
                if (i < this._items.length) {
                    item = this._items[i];
                    item.visible = true;
                } else {
                    item = fgui.UIPackage.createObject("main", "MainPageTabBtn") as MainPageTabBtn;
                    this.view.addChild(item);
                    this._items.push(item);
                }
                let x: number = 0;
                let y: number = 0;
                if (this._layout == MainPageTabListLayout.LEFT) {
                    //从左到右
                    x = Math.floor(showIdx / this._maxRow) * (item.width + this._colGap);
                    y = (showIdx % this._maxRow) * (item.height + this._lineGap);
                } else {
                    //从右到左
                    x = - item.width - Math.floor(showIdx / this._maxRow) * (item.width + this._colGap);
                    y = (showIdx % this._maxRow) * (item.height + this._lineGap);
                }
                item.x = x;
                item.y = y;
                if (fromRefreshUI == false) {
                    item.setData(cfgs[i]);
                }
                lastItem = item;
                showIdx++;
            } else if (i < this._items.length) {
                this._items[i].visible = false;
            }
        }
        if (cfgs.length < this._showFoldCnt || this._showFoldCnt <= 0) {
            this.view.btnFold.visible = false;
        } else {
            this.view.btnFold.visible = true;
            if (lastItem) {
                //有item展示
                this.view.btnFold.x = lastItem.x + lastItem.width * 0.5;
                this.view.btnFold.y = lastItem.y + lastItem.height + this.view.btnFold.height * 0.5;

            } else {

                this.view.btnFold.y = this.view.btnFold.height * 0.5;
                if (this._layout == MainPageTabListLayout.LEFT) {
                    this.view.btnFold.x = this.view.btnFold.width * 0.5;
                } else {
                    this.view.btnFold.x = -this.view.btnFold.width * 0.5;
                }
            }
        }
    }
}
