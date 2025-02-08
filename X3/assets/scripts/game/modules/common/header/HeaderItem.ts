import { tween } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { NumberFormatter } from "db://assets/scripts/core/utils/NumberFormatter";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import * as fgui from "fairygui-cc";

export class HeaderItem extends fgui.GButton implements INotification {
    private _itemId: number = 0;
    // 是否顶部 UI ?
    private _isTop: boolean = false;
    /**是否可跳转*/
    private _canJump: boolean = true;
    /**道具配置*/
    protected _itemCfg: table.item.ItemConfig = null
    /**道具最大数量*/
    protected _itemMaxCount: number = 0
    /**当前数量*/
    protected _itemCount: number = -1

    /**动画相关数据*/
    protected _curCount: number = -1
    protected _preAddCnt: number = 0
    protected _isPlayAni: boolean = false
    protected _aniInterval: number = 100
    protected _timerKey: string = null

    /**是否屏蔽来自事件的更新 需要自己处理更新时使用*/
    public isDisableUpdateFromEvent: boolean = false

    listenNotifications(): string[] | null {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                if (this.isDisableUpdateFromEvent == false) {
                    let data = args as Map<number, number>
                    if (data?.has(this._itemId)) {
                        this.refreshCount();
                    }
                }
                break;
        }
    }

    private get view(): ui.comm.header.HeaderItem {
        return this as any;
    }

    public get iconNode(): fgui.GObject {
        return this.view.imageItem
    }

    public get itemCfg(): table.item.ItemConfig {
        return this._itemCfg
    }

    protected onInit() {
        this.view.onClick(this.onClick0, this);
        G.FacadeManager.registerNotification(this);
    }

    protected onPreDispose() {
        G.FacadeManager.removeNotification(this);
        this.removeTimer();
    }

    /**更新文本显示*/
    protected updateLb(count: number, isShowEffect: boolean = false): void {
        // 数量格式化
        this.view.labelTitle.text = NumberFormatter.formatNumberToString(count);
        if (isShowEffect) {
            this.view.labelTitle.scaleX = 1.3;
            this.view.labelTitle.scaleY = 1.3;
            tween(this.view.labelTitle).to(0.1, { scaleX: 1, scaleY: 1 }, { easing: "quadOut" }).start()
        }
        // if (this._isTop == false) {
        //     if (this._itemMaxCount) {
        //         this.view.progressBarItem.max = this._itemMaxCount;
        //         this.view.progressBarItem.value = count;
        //     } else {
        //         // 无上限
        //         this.view.progressBarItem.value = 0;
        //     }
        // }
    }

    protected addTimer(): void {
        if (this._timerKey == null) {
            this._timerKey = G.GameTimer.loop(this._aniInterval, this, this.onTimer);
        }
        this.onTimer();
    }

    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
    }

    protected onTimer(): void {
        if (this._curCount != this._itemCount) {
            this._curCount += this._preAddCnt
            if (this._preAddCnt > 0 && this._curCount > this._itemCount) {
                this._curCount = this._itemCount
            } else if (this._preAddCnt < 0 && this._curCount < this._itemCount) {
                this._curCount = this._itemCount
            }
            this.updateLb(this._curCount, true)
        } else {
            this._isPlayAni = false
            this.removeTimer()
        }
    }

    /**刷新道具数量*/
    public refreshCount(delay: number = 0): void {
        if (this._itemId > 0) {
            const itemById = BackpackManager.ins().getItemById(this._itemId);
            let itemCount: number = 0
            if (itemById) {
                itemCount = itemById.count;
            }
            this.setItemCount(itemCount, delay)
        }
    }

    /**
     * 设置道具数量
     * @param delay 刷新延时 默认0 立即刷新
    */
    public setItemCount(count: number, delay: number = 0): void {
        if (this._itemCount != count) {
            this._itemCount = count
            if (delay <= 0) {
                this._curCount = count
                this.updateLb(this._itemCount)
            } else {
                this._isPlayAni = true
                let step: number = Math.ceil(delay / this._aniInterval)
                let addGold = this._itemCount - this._curCount
                this._preAddCnt = Math.max(1, Math.floor(addGold / step))
                this.addTimer()
            }
        }
    }

    public get itemId(): number {
        return this._itemId
    }

    public get itemCount(): number {
        return this._itemCount
    }

    /**
     * 重置绑定道具
     * @param itemId 道具id
     * @param isTop 是否顶部 顶部展示框不同
     * @param canJump 是否可跳转 优先级比道具配置高 可屏蔽配置了跳转的道具跳转
    */
    reset(itemId: number, isTop: boolean, canJump: boolean = true) {
        this._isTop = isTop;
        this._canJump = canJump;

        if (this._itemId != itemId) {
            this._itemId = itemId
            this._itemCfg = ItemUtils.getItemConfigByItemId(itemId);

            if (!this._itemCfg) {
                return;
            }
            const buyJumpId = this._itemCfg.buyJumpId;
            const isCanBuy0 = buyJumpId > 0;

            // + 号
            this.view.imageBuy.visible = isCanBuy0;
            this.view.imageItem.icon = this._itemCfg.iconPath;
            this.view.touchable = isCanBuy0 && canJump;

            this._itemMaxCount = ItemConfigManager.getItemMaxCountByItemId(itemId);
        }
        // UI
        this.view.getController("isTop").selectedIndex = isTop ? 1 : 0;
        this.refreshCount();
    }

    resetByMainPage(
        config: table.mainpage.MainPageHeaderItemConfig,
        isTop: boolean
    ) {
        if (!config) {
            return;
        }
        this.reset(config.itemId, isTop);
    }

    resetByNoItem(itemIcon: string, itemCount: number, isTop: boolean, maxCnt: number = 0): void {
        this._itemId = 0;
        this._isTop = isTop;
        this.view.imageItem.icon = itemIcon;
        if (maxCnt > 0) {
            this.view.labelTitle.text = NumberFormatter.formatNumberToString(itemCount) + '/' + NumberFormatter.formatNumberToString(maxCnt);
            // this.view.progressBarItem.max = maxCnt;
            // this.view.progressBarItem.value = itemCount;
        } else {
            this.view.labelTitle.text = NumberFormatter.formatNumberToString(itemCount)
            // this.view.progressBarItem.value = 0;
        }

        this.view.getController("isTop").selectedIndex = isTop ? 1 : 0;
    }

    onClick0() {
        if (this._itemId <= 0) {
            return
        }
        const itemConfig = ItemUtils.getItemConfigByItemId(this._itemId);
        if (!itemConfig) {
            return;
        }

        // 跳转id
        const buyJumpId = itemConfig.buyJumpId;
        if (buyJumpId == 0 || this._canJump == false) {
            return;
        }
        G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, buyJumpId)
    }

    /***飞金币到达后的特效 */
    public itemEffectCallback(targetNum: number, isEnd: boolean = false): void {
        this._itemCount += targetNum;
        if (!this.view.isDisposed) {
            this.view.labelTitle.text = NumberFormatter.formatNumberToString(this._itemCount);
            this.updateLb(this._itemCount, true)
            if (isEnd) {
                this.isDisableUpdateFromEvent = false;;
                this.refreshCount()
            }
        }
    }

    /***飞金币开始前的特效 */
    public itemEffectBeginCallback(): void {
        this.isDisableUpdateFromEvent = true;
    }
}
