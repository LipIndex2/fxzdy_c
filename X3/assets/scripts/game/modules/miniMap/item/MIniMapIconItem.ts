import { Tween, tween, v3, Vec3 } from "cc";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { NodeUtils } from "../../../../core/utils/NodeUtils";

@bindFguiExtension('ui://comm/MiniMapIconItem')
export class MiniMapIconItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "MiniMapIconItem";

    private _tween: Tween<any>;
    private _clickFun: Function;

    private get view(): ui.comm.miniMap.MiniMapIconItem {
        return this as any;
    }

    onInit() {
        this.view.lbLv.visible = false;
        this.view.itemIcon.on(fgui.Event.CLICK, this.onClickFun, this)
    }

    protected onPreDispose() {
        this._tween?.stop();

        super.onPreDispose();
    }

    private onClickFun() {
        if (this._clickFun) {
            this._clickFun();
        }
    }

    setIcon(icon: string) {
        this.view.itemIcon.icon = icon;
    }

    bezier(t: number, p0: Vec3, p1: Vec3, p2: Vec3): Vec3 {
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        return new Vec3(x, y, p0.z);
    }


    /**
     * 使用贝塞尔曲线飞行到目标位置
     * @param p1 点1
     * @param p2 点2
     * @param durationS 飞行时间，单位秒
     */
    flyByBezierCurvePath(p1: Vec3, p2: Vec3, durationS: number) {
        const startPos: Vec3 = this.view.node.position;

        const bezier = (t: number, p0: Vec3, p1: Vec3, p2: Vec3): Vec3 => {
            const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
            const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
            return v3(x, y, p0.z);
        };

        // this._tween?.stop();
        this._tween = tween(this.view)
            .to(durationS, {}, {
                onUpdate: (target, ratio) => {
                    const pos = bezier(ratio, startPos, p1, p2);
                    this.view.setPosition(pos.x, -pos.y);
                }
            })
            .call(() => {
                if (NodeUtils.isNotValidNode(this.view.node)) {
                    return;
                }

                // 动画结束后的回调，销毁节点
                this.dispose();
            })
            .start();
    }

    /** 
     * 上下浮动动画
     * @param durationS 动画时长 秒
     */
    floatUpDown(durationS: number) {
        if (this._tween) return;
        this._tween?.stop();
        this._tween = tween(this.view.itemIcon)
            .to(durationS, { y: this.view.itemIcon.y - 10 })
            .to(durationS, { y: this.view.itemIcon.y + 10 })
            .union()
            .repeatForever();

        this._tween?.start();
    }

    hideArrowIcon(): void {
        this.view.arrow.visible = false;
    }

    /** 设置箭头图片 */
    setArrowIcon(icon: string) {
        this.view.arrow.visible = true;
        this.view.arrow.icon = icon;
    }
    /** 头上箭头浮动动画 */
    floatArrow(durationS: number) {
        if (this._tween) return;
        this._tween?.stop();
        this._tween = tween(this.view.arrow)
            // .delay(1)
            .to(durationS, { y: this.view.arrow.y - 10 })
            .to(durationS, { y: this.view.arrow.y + 10 })
            // .delay(2)
            .union()
            .repeatForever();

        this._tween?.start();
    }

    /** 绑定点击事件 */
    bindClickEvent(callback: Function) {
        this._clickFun = callback;
    }

    /**设置等级*/
    setLv(lv: number): void {
        if (lv > 0) {
            this.view.lbLv.visible = true;
            this.view.lbLv.text = lv + '';
        } else {
            this.view.lbLv.visible = false;
        }
    }
}