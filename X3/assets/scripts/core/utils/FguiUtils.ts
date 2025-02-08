import { Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import { MathUtils } from "./MathUtils";
import { Rect } from "cc";
import { Sprite } from "cc";
import { tween } from "cc";
import { Tween } from "cc";

export default class FguiUtils {
    /**
     * 绑定fgui对象到对象中
     * @param gobj
     * @param thisObj
     */
    public static bindGObject(gobj: fgui.GComponent): void {
        // let childCom: fgui.GObject;
        // let childName: string;

        // let isCustomName = (name: string): boolean => {
        //     return name && (!/^n[0-9]+$/.test(name));//n1,n2这种fgui默认命名的忽略
        // }

        // const childNum: number = gobj.numChildren;
        // for (let i: number = 0; i < childNum; i++) {
        //     childCom = gobj.getChildAt(i);
        //     childName = childCom.name;
        //     if (isCustomName(childName) && gobj[childName] === void 0) {
        //         gobj[childName] = childCom;
        //         if(childCom instanceof fgui.GComponent){
        //             this.bindGObject(childCom);
        //         }
        //     }
        // }
    }

    /**
     * 检查某对象是否拓展类
     * @param gobi 
     * @returns 
     */
    public static isExtensionCls(gobi: fgui.GComponent): boolean {
        let pk = gobi.packageItem;
        return pk && pk.extensionType != null;
    }

    /**
     * 设置9宫
     * @param top 
     * @param bottom 
     * @param left 
     * @param right 
     */
    public set9Grid(gloader: fgui.GLoader, top: number, bottom: number, left: number, right: number): void {
        if (gloader._content && gloader._content.spriteFrame) {
            gloader._content.spriteFrame.insetTop = top;
            gloader._content.spriteFrame.insetBottom = bottom;
            gloader._content.spriteFrame.insetLeft = left;
            gloader._content.spriteFrame.insetRight = right;
            gloader._content.type = Sprite.Type.SLICED;
        }
    }

    /**
     * 替换富文本中的颜色 to 字体颜色
     * @param text
     * @param comp
     */
    static replaceRichTextWithFontColor(text: string, comp: fgui.GRichTextField): string {
        if (!text) {
            return;
        }
        const fontColor = comp.color; // 获取字体颜色

        // 正则表达式匹配颜色标签
        const colorRegex = /\[color=#......\]/g;

        // 使用 replaceAll 替换所有颜色标签为字体颜色标签
        // 设置新的富文本内容
        return text.replace(colorRegex, `[color=#${fontColor.toHEX("#rrggbb")}]`);
    }

    /**
    * 将显示对象从显示对象的（本地）坐标转换为舞台（全局）坐标
    * @param _mc 显示对象
    * @param p 用来接收结果的对象；不传值则自动使用重用的临时变量来存储值，注意不要保留临时变量的引用；
    * @return 舞台（全局）坐标
    * 
    */
    public static lToG(_mc: fgui.GComponent, p?: Vec2): Vec2 {
        if (p == null)
            p = new Vec2(0, 0);
        return _mc.localToGlobal(p.x, p.y) || p;
    }

    /**
     * 将显示对象从舞台（全局）坐标转换为显示对象的（本地）坐标。  
     * @param _mc 显示对象
     * @param p 用来接收结果的对象；不传值则自动使用重用的临时变量来存储值，注意不要保留临时变量的引用；
     * @return （本地）坐标
     * 
     */
    public static gToL(_mc: fgui.GComponent, p?: Vec2): Vec2 {
        if (p == null)
            p = new Vec2(0, 0);
        return _mc.globalToLocal(p.x, p.y);
    }

    /**
     * 将显示对象1的（本地）坐标转换为显示对象2的（本地）坐标
     * @param m1 显示对象1
     * @param m2 显示对象2
     * @return 坐标点
     * 
     */
    public static changeCoorTo(m1: fgui.GComponent, m2: fgui.GComponent): Vec2 {
        return this.lToG(m1).subtract(this.lToG(m2))
    }

    // /**从1的某个本地坐标 转到 2 的本地坐标*/
    public static getPointByPoint(c1: fgui.GComponent, c2: fgui.GComponent, point: Vec2): Vec2 {
        var p: Vec2 = this.lToG(c1, point);
        return this.gToL(c2, p);
    }

    /**
     * 按钮在长按状态下，会每间隔一段时间触发一次事件，参数repeat决定触发次数，interval决定触发间隔。
     * @param object 按钮
     * @param long_touch_func 触发事件
     * @param click_func  点击触发
     * @param repeat 控制触发次数，默认长按触发一次
     * @param interval 触发间隔 单位:s
     * @param longTouchTime 点击后，多久触发长按效果
     * @returns 返回的函数调用后可以取消长按
     */
    static AddLongTouchEvent(object: fgui.GButton, long_touch_func?: Function, click_func?: Function, repeat: number = 1, interval: number = 1, longTouchTime: number = 1) {
        let arg = {
            touch_cancel: null as () => void
        };
        let func = (evt_start: any) => {
            let touch_end: any
            let touch_move: any;
            let radius: number = 50;
            let start_x: number = evt_start.pos.x;
            let start_y: number = evt_start.pos.y;
            let is_long_touch = false;

            tween(object).delay(longTouchTime).call(() => {
                is_long_touch = true;
                long_touch_func && long_touch_func();
                if (repeat <= 0) {
                    tween(object).delay(interval).call(() => {
                        long_touch_func && long_touch_func();
                    }).union().repeatForever().start();
                } else if (repeat > 1) {
                    tween(object).delay(interval).call(() => {
                        long_touch_func && long_touch_func();
                    }).union().repeat(repeat - 1).start();
                }
            }).start();

            arg.touch_cancel = () => {
                Tween.stopAllByTarget(object);
                object.off(fgui.Event.TOUCH_END, touch_end);
                object.off(fgui.Event.TOUCH_MOVE, touch_move);
            }

            touch_end = () => {
                if (!is_long_touch) {
                    click_func && click_func();
                }

                arg.touch_cancel();
            }

            touch_move = (evt: any) => {
                let p = evt.pos
                if (Math.pow(p.x - start_x, 2) + Math.pow(p.y - start_y, 2) > Math.pow(radius, 2)) {
                    arg.touch_cancel();
                    return
                }
            }

            object.on(fgui.Event.TOUCH_END, touch_end);
            object.on(fgui.Event.TOUCH_MOVE, touch_move);
        }

        object.on(fgui.Event.TOUCH_BEGIN, func);

        return arg;
    }

}