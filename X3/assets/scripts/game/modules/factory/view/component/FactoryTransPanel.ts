import { Tween } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import GIns from "../../../../GIns";

/**
 * 星际工厂主界面传送带
 */
@bindFguiExtension('ui://factory/FactoryTransPanel')
export class FactoryTransPanel extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryTransPanel";

    protected _isPlaying: boolean = false
    protected _timerKey: string = null
    protected _vo: Vo.factory.ProductLineVo = null
    protected _cfg: table.factory.FactoryProductLineConfig = null
    protected _rewardIcons: string[] = []
    //每毫秒移动间隔
    protected _moveSpeed: number = 0.13
    protected _icons: ui.factory.component.FactoryIcon[] = []
    protected _iconPool: ui.factory.component.FactoryIcon[] = []
    protected _iconCreateInterval: number = 1500
    protected _lastIconCreateTime: number = 0
    protected _startY: number = 0
    protected _endY: number = 0
    protected _lastUpdateTime: number = 0
    private get view(): ui.factory.component.FactoryTransPanel {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {
        this.stop(true)
    }

    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.frameLoop(1, this, this.onTimer)
        }
    }

    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow
        let moveY: number = (nowTime - this._lastUpdateTime) * this._moveSpeed
        this._lastUpdateTime = nowTime
        if (nowTime - this._lastIconCreateTime > this._iconCreateInterval) {
            this._lastIconCreateTime = nowTime
            let icon = this.createIcon()
            this.setRandomItemIdFromReward(icon)
            icon.x = this.view.width * 0.5
            icon.y = this._startY
            this.view.addChild(icon)
            this._icons.push(icon)
        }

        for (let i = 0; i < this._icons.length; i++) {
            let icon = this._icons[i]
            icon.y += moveY
            if (icon.y > this._endY) {
                this._icons.splice(i, 1)
                i--
                this.removeIcon(icon)
            }
        }
    }

    protected createIcon(): ui.factory.component.FactoryIcon {
        if (this._iconPool.length > 0) {
            return this._iconPool.shift()
        }
        let icon = fgui.UIPackage.createObject("factory", "FactoryIcon") as ui.factory.component.FactoryIcon
        return icon
    }

    protected removeIcon(icon: ui.factory.component.FactoryIcon): void {
        if (icon) {
            Tween.stopAllByTarget(icon)
            icon.removeFromParent()
            this._iconPool.push(icon)
        }
    }

    public setRandomItemIdFromReward(icon: ui.factory.component.FactoryIcon): void {
        if (this._rewardIcons && this._rewardIcons?.length > 0) {
            if (this._rewardIcons.length == 1) {
                icon.iconLoader.icon = this._rewardIcons[0]
            } else {
                let randomIndex: number = Math.floor(Math.random() * this._rewardIcons.length)
                icon.iconLoader.icon = this._rewardIcons[randomIndex]
            }
        }
    }

    public start(vo: Vo.factory.ProductLineVo, cfg: table.factory.FactoryProductLineConfig): void {
        if (this._cfg && this._cfg.id == cfg?.id) {
            return
        }
        this._vo = vo
        this._cfg = cfg

        //初始化图标
        let rewards = GIns.factoryModel.getProdectLineRewards(this._cfg?.id)
        this._rewardIcons.length = 0
        rewards?.forEach((value) => {
            let cfg = G.TableManager.getDataById(table.item.ItemConfig, value.k)
            if (cfg) {
                this._rewardIcons.push(cfg.smallIconPath)
            }
        })
        this._startY = -100
        this._endY = this.view.height - this._startY
        if (this._isPlaying == false) {
            //初始化图标
            let curY: number = this._startY
            let offsetY: number = this._iconCreateInterval * this._moveSpeed
            while (curY <= this._endY) {
                let icon = this.createIcon()
                this.setRandomItemIdFromReward(icon)
                icon.x = this.view.width * 0.5
                icon.y = curY
                this.view.addChild(icon)
                this._icons.unshift(icon)
                curY += offsetY
            }
            this._lastUpdateTime = G.TimeManager.serverNow
            this._lastIconCreateTime = this._lastUpdateTime
            this.addTimer()
        }

        this._isPlaying = true

    }

    public stop(fromDispose: boolean = false): void {
        this.removeTimer()
        if (fromDispose == false) {
            this._icons?.forEach((icon) => {
                icon.dispose()
            })
        }
        this._icons.length = 0
        this._iconPool?.forEach((icon) => {
            icon.dispose()
        })
        this._iconPool.length = 0
        this._vo = null
        this._cfg = null
        this._isPlaying = false
    }

}