import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import G from "../../../../core/comm/G";
import { Vec2 } from "cc";
import { UIActivityKey } from "../../../modules/activity/const/UIActivityConfig";
import { TableManager } from "../../../../core/table/TableManager";
import { MyDecorator } from "../../../../core/decorator/MyDecorator";
import { EntranceMainViewOpenArgs } from "db://assets/scripts/game/modules/activity/entrance/structs/EntranceMainViewOpenArgs";
import GIns from "../../../GIns";
import { EnumJumpByCodeKeyName } from "../../../modules/jump/const/EnumJumpByCodeKeyName";
import { SeasonManager } from "../../../modules/season/SeasonManager";

@bindFguiExtension("ui://main/ActivityCom")
export class ActivityCom extends fgui.GComponent {
    /** 当前显示的活动index */
    private _index: number = 0;

    private _tabItem;

    private _time: number;

    /** 开启的活动配置 */
    private _activityCfgs: table.activity.ActivityConstant.ActivityClientConfig[];

    private get view(): ui.main.com.ActivityCom {
        return this as any;
    }

    public onInit() {
        this.view.list_tab.itemRenderer = this.tabItem.bind(this);

        //列表实现
        this.view.list_activity.itemRenderer = this.activityItem.bind(this);

        this.view.list_activity.on(fgui.Event.TOUCH_BEGIN, this.onListTouchStart, this);
        this.view.list_activity.on(fgui.Event.TOUCH_END, this.onListTouchEnd, this);

        // this.view.list_activity.on(fgui.Event.SCROLL_END, this.onListScrollEnd, this);
    }

    public setData(activityCfgs: table.activity.ActivityConstant.ActivityClientConfig[]) {
        if (!activityCfgs) {
            this.clearAnim();
            return;
        }
        this._activityCfgs = activityCfgs;
        if (this._index >= this._activityCfgs.length) {
            this._index = this._activityCfgs.length - 1;
        }
        this.view.list_tab.numItems = this._activityCfgs.length;
        this.view.list_activity.numItems = this._activityCfgs.length;
        this.clearAnim();
        this.updateView();

        if (!this._time) this._time = +TableManager.getDataById(table.activity.ActivityConstant.ActivityConstantConfig, "ACTIVITY:SCROLL_TIME").content;
        if (this._activityCfgs.length > 1) {
            this.view.list_activity.setVirtualAndLoop();
            // this.playScrollAnim();
            G.GameTimer.loop(this._time, this, this.playScrollAnim);
        } else {
            this.clearAnim();
        }

        // 不知道为什么，这其他地图上线，然后回到主城，列表的图片显示不出来，要重新加载一遍列表才出现
        G.GameTimer.once(300, this, () => {
            this.view.list_activity.numItems = this._activityCfgs.length;
        });
    }

    //播放切换图片
    private playScrollAnim() {
        this.updateIndex(true);
        this.updateTabSel();
        if (this._index == 0) {
            this.view.list_activity.scrollPane.scrollRight(1, true);
        } else {
            this.view.list_activity.scrollToView(this._index, true);
        }
    }

    /** 计算index */
    private updateIndex(isNext: boolean) {
        this._index = isNext ? this._index + 1 : this._index - 1;
        if (this._index < 0) this._index = this._activityCfgs.length - 1;
        if (this._index >= this._activityCfgs.length) this._index = 0;
    }

    private updateView() {
        // this.view.scrollItem.item.img_icon.icon = this._activityCfgs[this._index].rollIcon;
        // this.view.scrollItem.item.T_name.text = this._activityCfgs[this._index].name;
        // this.view.scrollItem.nextItem.x = 233;

        this.updateTabSel();
    }

    private tabItem(index: number, item: ui.main.item.scrollRedItem) {
        item.clearClick();
        item.onClick(() => {
            this.onTabClickItem(index);
        }, this);
    }

    // 上次触摸位置
    private _tempVec: Vec2 = new Vec2(0, 0);
    //初始位置
    private _startPos: Vec2;

    //活动入口
    private openView() {
        let cfg = this._activityCfgs[this._index];
        if (cfg && cfg.UIView) {
            G.UIManager.open(cfg.UIView, cfg);
        } else if (!cfg.parentId) {
            GIns.jumpManager.jumpById(cfg.typeParam);
        } else {
            G.UIManager.open(UIActivityKey.EntranceMainView, {
                id: cfg.parentId,
                defaultTypeParam: cfg.typeParam,
            } as EntranceMainViewOpenArgs);
        }
    }

    //清理动画
    public clearAnim() {
        G.GameTimer.clearAll(this);
        // Tween.stopAllByTarget(this.view.scrollItem.item);
        // Tween.stopAllByTarget(this.view.scrollItem.nextItem);
        // this.view.scrollItem.item.x = 0;
        // this.view.scrollItem.nextItem.x = 233;
    }

    public onPreDispose(): void {
        this.clearAnim();
    }

    @MyDecorator.AntiShakeCallFunc(200)
    private onTabClickItem(index: number) {
        this.clearAnim();
        this._index = index;
        this.view.list_activity.scrollToView(this._index, true, false);
        this.updateTabSel();
        G.GameTimer.loop(this._time, this, this.playScrollAnim);
    }

    updateTabSel() {
        if (this._tabItem) {
            this._tabItem.img_sel.visible = false;
        }
        if (this._index < this.view.list_tab.numItems) {
            this._tabItem = this.view.list_tab.getChildAt(this._index);
            if (!this._tabItem) {
                return;
            }
            this._tabItem.img_sel.visible = true;
        }
    }

    //列表
    activityItem(index: number, item: ui.main.item.scrollImageItem) {
        let cfg = this._activityCfgs[index];
        item.img_icon.icon = cfg.rollIcon;
        item.T_name.text = cfg.name;

        //赛季要处理
        if (SeasonManager.ins().isSeasonJump(cfg.typeParam)) {
            item.T_name.text = SeasonManager.ins().getSeasonClientName();
        }
    }

    // private _isTouch: boolean = false;
    // /** 滑动结束 */
    // private onListScrollEnd() {
    //     if (!this._isTouch) return;
    //     this._isTouch = false;
    // }

    /** 触摸开始 */
    private onListTouchStart(evt: fgui.Event) {
        // this._isTouch = true;
        this.clearAnim();

        let x = evt.pos.x;
        let y = evt.pos.y;
        let pos = this._tempVec.set(x, y);
        this._startPos = new Vec2(0, 0);
        this._startPos.set(pos);
    }

    /** 触摸结束 */
    private onListTouchEnd(event: fgui.Event) {
        if (!this._startPos) return;
        let x = event.pos.x;
        let y = event.pos.y;
        let pos = this._tempVec.set(x, y);
        const delta = new Vec2(pos.x - this._startPos.x, pos.y - this._startPos.y);
        if (Math.abs(delta.x) > 20) {
            // 切换图片
            if (Math.abs(delta.x) > 233) {
                let count = Math.abs(delta.x) / 233;
                count = Math.round(count);
                for (let i = 1; i <= count; i++) {
                    if (delta.x > 0) {
                        this.updateIndex(false);
                    } else {
                        this.updateIndex(true);
                    }
                }
                this.onTabClickItem(this._index);
            } else {
                let ratio = 1 - Math.abs(delta.x) / 233;
                // ratio = Math.abs(ratio) > 1 ? 1 : Math.abs(ratio);
                if (delta.x > 0) {
                    this.updateIndex(false);
                    this.scrollList("left", ratio);
                } else {
                    this.updateIndex(true);
                    this.scrollList("right", ratio);
                }
            }
        } else {
            // 复原位置
            let ratio = Math.abs(delta.x) / 233;
            if (delta.x > 0) {
                this.scrollList("right", ratio);
            } else {
                this.scrollList("left", ratio);
            }
            this.openView();
        }

        this._startPos = null;
        // G.GameTimer.loop(3000, this, this.playScrollAnim);
    }

    // 滚动列表的方法
    // @MyDecorator.AntiShakeCallFunc(300)
    scrollList(direction: "left" | "right", ratio: number = 1, ani: boolean = true) {
        const scrollPane = this.view.list_activity.scrollPane;

        switch (direction) {
            case "left":
                scrollPane.scrollLeft(ratio, ani);
                break;
            case "right":
                scrollPane.scrollRight(ratio, ani);
                break;
            default:
                console.error("Invalid direction provided.");
        }
        this.updateTabSel();
        G.GameTimer.loop(this._time, this, this.playScrollAnim);
    }

    // private isInChooseRange() {
    //     const x = this.view.x - this._scrollX + this.view.width / 2;
    //     const diffX = Math.abs(x - this._xCenter);
    //     return diffX < this.view.width;
    // }
}
