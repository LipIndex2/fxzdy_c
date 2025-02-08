import { Node, tween, Tween, Vec3 } from "cc";
import { EDITOR } from "cc/env";
import { MathUtils } from "../utils/MathUtils";
import { NodeUtils } from "../utils/NodeUtils";

declare module "cc" {

    /**
     *  全局扩展 cc.Node
     */
    interface Node {
        /**
         *
         * @param durationSeconds
         * @param smallRate
         */
        clickWithUIScaleTween(durationSeconds?: number, smallRate?: number): Tween<Node>;

        /**
         * 仅用于位置计算
         * 实则为Vec3
         */
        get pos(): Vec2;

        get rect(): Rect;
    }
}

/**
 * 点击进行 UI 缩放动画
 * @param durationSeconds 持续时间
 * @param smallRate 缩小比例
 */
Node.prototype.clickWithUIScaleTween = function (
    durationSeconds: number = 0.05,
    smallRate: number = 0.8
): Tween<Node> {

    const scale = this.scale;
    const oldScale: Vec3 = scale.clone();
    const smallScale: Vec3 = oldScale.clone().multiply3f(smallRate, smallRate, 1);

    return tween(this)
        .to(durationSeconds, { scale: smallScale })
        .to(durationSeconds, { scale: oldScale })
        .start()
}

if (!EDITOR) {
    Object.defineProperty(Node.prototype, 'pos', {
        get: function () {
            return this.position;
        }
    });

    Object.defineProperty(Node.prototype, 'rect', {
        get: function () {
            return NodeUtils.tempRect(this);
        }
    });

}
