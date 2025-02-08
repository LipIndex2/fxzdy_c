import { tween } from "cc";
import BaseSingleton from "../base/BaseSingleton";
import { Tween } from "cc";
import * as fgui from "fairygui-cc";
import ArrayUtils from "../utils/ArrayUtils";

/***
 * 界面特效管理
 */
export class UiTweenMgr extends BaseSingleton {

    public tween1(mc: fgui.GComponent): Tween<any> {
        let pivotX = mc.pivotX;
        let pivotY = mc.pivotY;
        mc.pivotX = mc.pivotY = 0.5;
        let tweenObj = tween(mc)
            .to(0.1, { scaleX: 1.04, scaleY: 1.04 })
            .to(0.1, { scaleX: 1, scaleY: 1 })
            .call(() => {
                if (!mc.isDisposed) {
                    mc.pivotX = pivotX;
                    mc.pivotY = pivotY;
                }
            })
            .start()

        return tweenObj
    }

    /***列表展开特效 */
    public listShowEffect(list: fgui.GComponent, bg?: fgui.GImage): void {
        this.removeTweenEffect(list, bg)
        let oldpivotX = list.pivotX
        let oldpivotY = list.pivotY
        list.pivotX = list.pivotY = 0.5;
        list.scaleX = list.scaleY = 0.8;
        list.alpha = 0;
        tween(list).delay(0.2).to(0.3, { alpha: 1 }).start()
        tween(list).delay(0.2).to(0.3, { scaleX: 1, scaleY: 1 }, { easing: "backOut" }).call(() => {
            if (list?.node?.isValid) {
                list.pivotX = oldpivotX
                list.pivotY = oldpivotY
            }
        }).start()
        if (bg) {
            bg.pivotY = 1;
            bg.scaleY = 0;
            tween(bg).to(0.33, { scaleY: 1 }, { easing: "circOut" }).start()
        }
    }

    public removeTweenEffect(...objs): void {
        for (let i = 0; i < objs.length; i++) {
            if (objs[i])
                Tween.stopAllByTarget(objs[i])
        }
    }

    private listItemRenderEffectMap: { [uuid: string]: number[] } = {}
    /***
     * delay 多久后开始执行特效
     * delay 每1个元素的执行间隔
     */
    public listItemRendererEffect(uuid: string, fcn: Function, thisObj: any, parm?: { delay?: number, delay2?: number, beginIndex?: number }): fgui.ListItemRenderer {
        this.listItemRenderEffectMap[uuid] = [];
        return this.onListItemRendererEffect.bind(this, fcn, thisObj, uuid, parm)
    }

    public removeListItemRendererEffect(uuid: string): void {
        delete this.listItemRenderEffectMap[uuid];
    }

    public resetListItemRendererEffect(list: fgui.GList): void {
        let uuid = list.node.uuid;
        for (let i = 0; i < list._children.length; i++) {
            list._children[i]["__onListItemRendererEffect__"] = false;
            // if (!this.listResetItemRenderEffectMap[uuid])
            //     this.listResetItemRenderEffectMap[uuid] = [];
            // this.listResetItemRenderEffectMap[uuid].push(this.listItemRenderEffectMap[uuid][i])
        }
        this.listItemRenderEffectMap[uuid] = []
    }

    private onListItemRendererEffect(fcn: Function, thisObj: any, uuid: string, parm: { delay: number, delay2: number, beginIndex?: number }, index: number, item: fgui.GComponent): void {
        if (this.listItemRenderEffectMap[uuid]) {
            if ((!item["__onListItemRendererEffect__"] && this.listItemRenderEffectMap[uuid].indexOf(index) == -1)) {

                item.alpha = 0;
                let delay2 = 50;
                let b = true;
                let beginIndex = 0;
                if (parm) {
                    if (parm.beginIndex) {
                        beginIndex = parm.beginIndex;
                    }

                    if (parm.delay2)
                        delay2 = parm.delay2
                    if (parm.delay) {
                        tween(item).delay(parm.delay / 1000).delay(((index - beginIndex) < 0 ? 0 : (index - beginIndex)) * (delay2 * 0.001)).to(0.3, { alpha: 1 }).start()
                        b = false
                    }
                }
                if (b)
                    tween(item).delay(((index - beginIndex) < 0 ? 0 : (index - beginIndex)) * (delay2 * 0.001)).to(0.3, { alpha: 1 }).start()
            }
        }

        fcn.call(thisObj, index, item)
        if (this.listItemRenderEffectMap[uuid]) {
            ArrayUtils.iPush(this.listItemRenderEffectMap[uuid], index)
        }
        item["__onListItemRendererEffect__"] = true;
    }

    /***右边插入的动画,item必须被1个nodeSp容器包着 */
    public listItemRendererEffect2(uuid: string, fcn: Function, thisObj: any, parm?: { delay2?: number, x?: number, beginIndex: number }): fgui.ListItemRenderer {
        this.listItemRenderEffectMap[uuid] = [];
        return this.onListItemRendererEffect2.bind(this, fcn, thisObj, uuid, parm)
    }

    private onListItemRendererEffect2(fcn: Function, thisObj: any, uuid: string, parm: { delay2: number, x: number, beginIndex: number }, index: number, item: fgui.GComponent): void {
        if (!item["nodeSp"]) {
            return
        }

        let b = false
        if (this.listItemRenderEffectMap[uuid]) {
            if ((!item["__onListItemRendererEffect__"] && this.listItemRenderEffectMap[uuid].indexOf(index) == -1)) {

                let fromX = item["nodeSp"].x;
                item["nodeSp"].x = 300;
                let delay2 = 30;
                if (parm?.delay2)
                    delay2 = parm.delay2;

                if (parm?.x)
                    item["nodeSp"].x = parm.x;

                let beginIndex = 0;

                if (parm?.beginIndex) {
                    beginIndex = parm.beginIndex;
                }

                tween(item["nodeSp"]).delay(((index - beginIndex) < 0 ? 0 : (index - beginIndex)) * (delay2 * 0.001)).to(0.15, { x: fromX }).start()
                b = true
            }
        }

        fcn.call(thisObj, index, item)
        if (this.listItemRenderEffectMap[uuid]) {
            ArrayUtils.iPush(this.listItemRenderEffectMap[uuid], index)
        }
        item["__onListItemRendererEffect__"] = true;
    }

}