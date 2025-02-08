import { UIOpacity } from "cc";
import { ITweenOption, Node, Tween, tween, v3, Vec2 } from "cc";
import * as fgui from "fairygui-cc";

export class TweenUtils {

    /**
     * 在 y 轴 yoyo 晃动
     * @param node
     * @param duration
     * @param offsetY
     */
    static yoyoOnAxisY(node: Node, duration: number = 1, offsetY: number = 20): Tween<Node> {
        // 箭头漂浮
        return tween(node)
            .sequence(
                tween().by(duration, { position: v3(0, offsetY, 0) }, { easing: 'smooth' }),
                tween().by(duration, { position: v3(0, -offsetY, 0) }, { easing: 'smooth' })
            )
            .repeatForever()
            .start()
    }

    /**
     * 在 alpha yoyo 
     * @param node
     * @param duration
     * @param offsetY
     */
    static yoyoAlpha(node: Node, duration: number = 1, alphaBegin: number = 0, alphaEnd: number = 255) {
        let alphaCom: UIOpacity = node.getComponent(UIOpacity);
        if (!alphaCom)
            alphaCom = node.addComponent(UIOpacity);
        return tween(alphaCom)
            .sequence(
                tween().to(duration, { opacity: alphaBegin }, { easing: 'smooth' }),
                tween().to(duration, { opacity: alphaEnd }, { easing: 'smooth' })
            )
            .repeatForever()
            .start()
    }

    /**
     * @desc 贝塞尔
     * @param target
     * @param {number} duration 时长 单位秒
     * @param {Vec2} p1 起点坐标
     * @param {Vec2} cp 控制点
     * @param {Vec2} p2 终点坐标
     * @param {object} opts
     * @returns {any}
     */
    static bezierTo(target: fgui.GComponent,
        duration: number,
        p1: Vec2,
        cp: Vec2,
        p2: Vec2,
        opts?: ITweenOption
    ): Tween<fgui.GComponent> {
        opts = opts || Object.create(null)
        let twoBezier = (t: number, p1: Vec2, cp: Vec2, p2: Vec2) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y
            return new Vec2(x, y)
        }
        opts.onUpdate = (_arg: Vec2, ratio: number) => {
            let pos = twoBezier(ratio, p1, cp, p2)
            target.setPosition(pos.x, pos.y)
        }
        return tween(target).to(duration, {}, opts)
    }
}