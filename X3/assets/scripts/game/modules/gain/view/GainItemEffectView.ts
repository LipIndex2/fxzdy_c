import { tween, Tween, Vec2 } from "cc";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TweenUtils } from "../../../../core/utils/TweenUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIGainKeys } from "../const/UIGainKeys";
import { GainItemEffectUtils } from "./GainItemEffectUtils";

export class GainItemEffectViewOpenArgs {
    items: NoOwnerItem[];
    startX: number
    startY: number
    /***对应items的itemId的新的目标坐标 */
    otherXys?: { [itemId: number]: { x: number, y: number } };
    randomX: number

    static create(items: NoOwnerItem[],
        startX: number = -999,
        startY: number = -999,
        otherXys?: { [itemId: number]: { x: number, y: number } },
        randomX: number = 500,
    ): GainItemEffectViewOpenArgs {
        const args = new GainItemEffectViewOpenArgs();
        args.items = items;
        args.startX = startX
        args.startY = startY
        args.otherXys = otherXys
        args.randomX = randomX;
        return args;
    }
}

/**
 * 获得道具特效界面
 */
@bindScript(UIGainKeys.GainItemEffectView)
export class GainItemEffectView extends UIWin {

    static pkgName: string = "gain";

    static viewName: string = "GainItemEffectView";

    public _layer = EnumUIViewLayer.TIPS;

    /**每项图标数量上限*/
    protected _maxPerIconCount: number = 10

    protected _iconMap: Map<string, number> = new Map()
    protected _otherIconMap: Map<string, { count: number, otherXy?: { x: number, y: number } }> = new Map()

    protected _icons: ui.gain.GainItemIcon[] = []
    protected _iconPools: ui.gain.GainItemIcon[] = []

    private get view(): ui.gain.GainItemEffectView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {

    }


    public onInit(): void {

    }

    public onOpen(args: GainItemEffectViewOpenArgs): void {
        if (args == null) {
            this.closeSelf()
            return
        }
        Tween.stopAllByTarget(this)
        this.clearIcon()
        let modelNode = this.view.bagNode.modelNode as ModelNode
        modelNode.loadByPath('spine/ui/G_gongxihuode_xingxing/gongxihuode_xingxing')
        modelNode.setCompleteListener(() => {
            if (this.view?.node?.isValid) {
                modelNode.visible = false
            }
        })
        modelNode.visible = false
        this.view.bagNode.getTransition('t0').play()
        this._iconMap.clear()
        this._otherIconMap.clear()
        let otherPos = GainItemEffectUtils.nextEffectOtherMap ? GainItemEffectUtils.nextEffectOtherMap : args?.otherXys;
        args?.items?.forEach((value) => {
            let iconPath = value.getItemSmallIconPath()
            if (otherPos && otherPos[value.itemId]) {
                //额外目标不设置在这里
                this._otherIconMap.set(iconPath, { count: value.count, otherXy: otherPos[value.itemId] });
            }
            else
                this._iconMap.set(iconPath, value.count)
        })
        this.beginEffect(args, modelNode);
        this.beginOtherEffect(args);
        GainItemEffectUtils.nextEffectOtherMap = null;
    }

    private beginOtherEffect(args: GainItemEffectViewOpenArgs): void {
        let totalDelay = 0.1;
        const myStartY = args.startY;
        const myStartX = args.startX;

        this._otherIconMap.forEach((data: { count: number, otherXy?: { x: number, y: number } }, iconUrl: string) => {
            let endPos = new Vec2(data.otherXy.x, data.otherXy.y)
            let offsetY = endPos.y - this.view.startNode.y
            if (offsetY > 80) {
                offsetY -= 80
            }

            let maxDelay = 0
            let nextDelayRandom = Math.random() * 0.3 + 0.2
            let len = Math.min(this._maxPerIconCount, data.count)
            let randomSeed = Math.min(Math.random() * len * 0.3, 1)
            for (let i = 0; i < len; i++) {
                let icon = this.createIcon()
                icon.iconLoader.icon = iconUrl
                icon.setScale(0, 0)
                this._icons.push(icon)
                this.view.addChild(icon)

                const myStartX = args.startX;
                let startX = myStartX;
                if (startX == -999) {
                    startX = Math.random() * 500 + 50;
                } else {
                    startX = startX + Math.random() * 50 + 50
                }

                let ratioX = startX / this.view.width
                let startInitY = myStartY != -999 ? myStartY : this.view.startNode.y
                let startY = startInitY + Math.random() * ratioX * offsetY
                icon.setPosition(startX, startY)

                let offsetX = endPos.x - startX
                let offsetY2: number = endPos.y - startY
                let centerPos = new Vec2(startX + Math.random() * (offsetX + 100), startY + Math.random() * offsetY2)
                let bezierTween = TweenUtils.bezierTo(icon, 0.3, new Vec2(startX, startY), centerPos, endPos, { easing: 'quadInOut' })
                let scaleTween = tween(icon).to(0.2, { scaleX: 1, scaleY: 1 })
                let delay = Math.random() * randomSeed + totalDelay
                if (maxDelay < delay) {
                    maxDelay = delay
                }


                let randomScale = Math.random() * 0.8 + 0.4
                tween(icon)
                    .delay(delay)
                    .to(0.1, { scaleX: randomScale, scaleY: randomScale })
                    .parallel(bezierTween, scaleTween)
                    .delay(0.05)
                    .call(() => {
                        if (this.view?.node?.isValid) {
                            this.removeIcon(icon)
                        }
                    })
                    .start()
            }
            totalDelay = maxDelay * nextDelayRandom
        })
    }

    private beginEffect(args: GainItemEffectViewOpenArgs, modelNode: ModelNode): void {
        let totalDelay = 0.1
        let totalTime = 0
        let endPos = new Vec2(this.view.bagNode.x + this.view.bagNode.width * 0.5, this.view.bagNode.y + this.view.bagNode.height * 0.5)
        let offsetY = endPos.y - this.view.startNode.y
        if (offsetY > 80) {
            offsetY -= 80
        }

        const myStartY = args.startY;
        const myStartX = args.startX;
        let startInitY = myStartY != -999 ? myStartY : this.view.startNode.y

        this._iconMap.forEach((count: number, iconUrl: string) => {
            let maxDelay = 0
            let nextDelayRandom = Math.random() * 0.3 + 0.2
            let len = Math.min(this._maxPerIconCount, count)
            let randomSeed = Math.min(Math.random() * len * 0.3, 1)
            for (let i = 0; i < len; i++) {
                let icon = this.createIcon()
                icon.iconLoader.icon = iconUrl
                icon.setScale(0, 0)
                this._icons.push(icon)
                this.view.addChild(icon)

                const myStartX = args.startX;
                let startX = myStartX;
                if (startX == -999) {
                    startX = Math.random() * 500 + 50;
                } else {
                    startX = startX + Math.random() * 50 + 50
                }

                let ratioX = startX / this.view.width
                let startY = startInitY + Math.random() * ratioX * offsetY
                icon.setPosition(startX, startY)

                let offsetX = endPos.x - startX
                let offsetY2: number = endPos.y - startY
                let centerPos = new Vec2(startX + Math.random() * (offsetX + 100), startY + Math.random() * offsetY2)
                let bezierTween = TweenUtils.bezierTo(icon, 0.3, new Vec2(startX, startY), centerPos, endPos, { easing: 'quadInOut' })
                let scaleTween = tween(icon).to(0.2, { scaleX: 1, scaleY: 1 })
                let delay = Math.random() * randomSeed + totalDelay
                if (maxDelay < delay) {
                    maxDelay = delay
                }


                let randomScale = Math.random() * 0.8 + 0.4
                tween(icon)
                    .delay(delay)
                    .to(0.1, { scaleX: randomScale, scaleY: randomScale })
                    .parallel(bezierTween, scaleTween)
                    .call(() => {
                        if (this.view?.node?.isValid) {
                            this.view.bagNode.getTransition('t1').play()
                            modelNode.visible = true
                            modelNode.playOrders([
                                {
                                    name: 'idle',
                                    isLoop: false
                                }
                            ])
                        }
                    })
                    .delay(0.05)
                    .call(() => {
                        if (this.view?.node?.isValid) {
                            this.removeIcon(icon)
                        }
                    })
                    .start()
            }
            totalDelay = maxDelay * nextDelayRandom
            if (maxDelay + 1 > totalTime) {
                totalTime = maxDelay + 1
            }
        })
        tween(this)
            .delay(totalTime)
            .call(() => {
                if (this.view?.node?.isValid) {
                    this.view.bagNode.getTransition('t2').play(() => {
                        this.closeSelf()
                    })
                }
            })
            .start()
    }

    public onClose(): void {
        Tween.stopAllByTarget(this)
        this.clearIcon()
    }

    protected createIcon(): ui.gain.GainItemIcon {
        if (this._iconPools.length > 0) {
            return this._iconPools.shift()
        }
        let icon = fgui.UIPackage.createObject("gain", "GainItemIcon") as ui.gain.GainItemIcon
        icon.touchable = false
        return icon
    }

    protected removeIcon(icon: ui.gain.GainItemIcon): void {
        if (icon) {
            let index = this._icons.indexOf(icon)
            if (index != -1) {
                this._icons.splice(index, 1)
            }
            icon.removeFromParent()
            this._iconPools.push(icon)
        }
    }

    protected clearIcon(): void {
        this._icons.forEach((icon) => {
            Tween.stopAllByTarget(icon)
            icon?.removeFromParent()
        })
        this._iconPools?.forEach((icon) => {
            icon.dispose()
        })
        this._iconPools.length = 0
    }
}