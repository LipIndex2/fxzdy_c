import { tween, Tween, v3, Vec3 } from "cc";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import * as fgui from "fairygui-cc";


/** 道具icon */
export class IconItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "IconItem";
    private _tween: Tween<any>;

    private get view(): ui.comm.item.IconItem {
        return this as any;
    }

    onInit() {

    }

    protected onPreDispose() {
        this._tween?.stop();

        super.onPreDispose();
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
}