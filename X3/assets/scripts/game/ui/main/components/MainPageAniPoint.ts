import { Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../event/NotificationKey";
import { UnlockResAnimNode } from "../../../modules/common/anim/UnlockResAnimNode";
import { HeaderItem } from "../../../modules/common/header/HeaderItem";
import { UITransform } from "cc";
import { Vec3 } from "cc";

/**接收动画事件参数*/
export interface IMainPageAddItemAniArgs {
    rewards: Vo.reward.RewardResult[]
    fromComp: fgui.GObject
    /**是否是地图上的UI 如果是的话 需要每次都计算其实位置 防止玩家移动全局坐标发生变化*/
    isMapUI?: boolean
    offsetX?: number
    offsetY?: number
}

/**一次动画对象*/
class MainPageAniItemForOnce {
    public createFunc: (pos: Vec2) => void
    public endFunc: (item: MainPageAniItemForOnce) => void
    protected _container: fgui.GComponent = null;
    protected _args: IMainPageAddItemAniArgs = null
    protected _iconPath: string = null
    protected _count: number = 0
    protected _startPos: Vec3 = null
    protected _endPos: Vec3 = null
    constructor(container: fgui.GComponent) {
        this._container = container
    }

    public play(args: IMainPageAddItemAniArgs, iconPath: string, count: number, endPos: Vec3): number {
        this._args = args
        this._iconPath = iconPath
        this._count = count
        this._endPos = endPos
        if (this._count > 10) {
            this._count = Math.ceil(this._count / 10) + 10
        }
        if (this._count > 20) {
            this._count = 20
        }
        let interval = 100
        if (this._count > 10) {
            //最多一秒播完
            interval = Math.floor(1000 / this._count)
        }
        G.GameTimer.loop(interval, this, this.onTimer)
        this.onTimer()
        return this._count * interval + UnlockResAnimNode.tweenTime
    }

    protected onTimer(): void {
        if (this._startPos == null || this._args.isMapUI) {
            if (this._args.fromComp?.node?.isValid) {
                let startPos: Vec3 = this._args.fromComp.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO)
                this._startPos = this._container.node.getComponent(UITransform).convertToNodeSpaceAR(startPos)
            } else {
                this._count = 0
                this._startPos = null
            }
        }
        if (this._startPos) {
            let anim = UnlockResAnimNode.create();
            anim.play(this._iconPath, this._startPos, this._endPos);
            this._container.addChild(anim);
        }
        this._count--
        if (this._count <= 0) {
            G.GameTimer.clearAll(this)
            G.GameTimer.once(UnlockResAnimNode.tweenTime, this, () => {
                if (this.endFunc) {
                    this.endFunc(this)
                }
            })
        }
    }

    public clear(): void {
        G.GameTimer.clearAll(this)
    }
}

/**每个道具的动画对象*/
class MainPageAniItem {
    protected _headerItem: HeaderItem = null;
    protected _container: fgui.GComponent = null;
    protected _endPos: Vec3 = null;
    protected _startPos: Vec3 = null;

    protected _onceItems: MainPageAniItemForOnce[] = []

    constructor(headerItem: HeaderItem, container: fgui.GComponent) {
        this._headerItem = headerItem
        this._container = container
    }

    protected onPlayOnceComplete(item: MainPageAniItemForOnce): void {
        let index = this._onceItems.indexOf(item)
        if (index != -1) {
            this._onceItems.splice(index, 1)
            if (this._onceItems.length <= 0) {
                //全部播放完成
                this._headerItem.isDisableUpdateFromEvent = false
                this._headerItem.refreshCount()
            }
        }
    }

    public play(args: IMainPageAddItemAniArgs, targetReward: Vo.reward.RewardResult): void {
        if (this._endPos == null) {
            //计算结束位置 结束位置在ui上 不会变化 计算一次就够了
            let endPos: Vec3 = this._headerItem.iconNode.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO)
            this._endPos = this._container.node.getComponent(UITransform).convertToNodeSpaceAR(endPos)
        }
        /**屏蔽事件更新*/
        this._headerItem.isDisableUpdateFromEvent = true
        let onceItem = new MainPageAniItemForOnce(this._container)
        this._onceItems.push(onceItem)
        onceItem.endFunc = this.onPlayOnceComplete.bind(this)
        let completeTime = onceItem.play(args, this._headerItem.itemCfg.smallIconPath, targetReward.amount, this._endPos)
        let targetCount = this._headerItem.itemCount + targetReward.amount
        G.GameTimer.once(UnlockResAnimNode.tweenTime, this, () => {
            if (this._container?.node?.isValid) {
                this._headerItem.setItemCount(targetCount, completeTime)
            }
        })
    }

    public clearAll(): void {
        this._onceItems.forEach((onceItem) => {
            onceItem.clear()
        })
        this._onceItems.length = 0
        this._headerItem.isDisableUpdateFromEvent = false
        this._headerItem.refreshCount()
    }
}

/**主界面物品获得动画*/
@bindFguiExtension('ui://main/MainPageAniPoint')
export class MainPageAniPoint extends fgui.GComponent implements INotification {
    protected _waitAniArgsList: IMainPageAddItemAniArgs[] = []
    /**当前缓存的需要播放动画的差值*/
    protected _curOffsetValueMap: Map<number, number> = new Map()
    protected _headerItemMap: Map<number, MainPageAniItem> = new Map()


    private get view(): ui.main.components.MainPageAniPoint {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_WITH_MAIN_ANI
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_WITH_MAIN_ANI:
                this.playAniByArgs(args)
                break
        }
    }

    protected onInit() {
        G.FacadeManager.registerNotification(this)
    }

    protected onPreDispose() {
        this.clearAll()
        G.FacadeManager.removeNotification(this)
    }

    protected playAniByArgs(args: IMainPageAddItemAniArgs): void {
        args?.rewards?.forEach((reward) => {
            if (this._headerItemMap.has(reward.baseId)) {
                this._headerItemMap.get(reward.baseId).play(args, reward)
            }
        })
    }

    /**添加展示对象*/
    public addHeaderItem(item: HeaderItem): void {
        if (this._headerItemMap.has(item.itemId) == false) {
            this._headerItemMap.set(item.itemId, new MainPageAniItem(item, this))
        }
    }

    public clearAll(): void {
        this._headerItemMap.forEach((value) => {
            value.clearAll()
        })
        this.removeChildren()
    }
}