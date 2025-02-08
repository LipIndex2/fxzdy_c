import { Vec2, v2 } from "cc";
import { MathUtils } from "../../../core/utils/MathUtils";
import { BattleDebugManager } from "../battle/BattleDebugManager";

export class CollisionUtils {
    static tempVec = v2();

    /**
     * A点向B点移动
     * @param out a指向b 的向量
     * @param v_scale 向量倍速
     */
    static calVec(out: Vec2, a: Vec2, b: Vec2, v_scale: number) {
        let radian = MathUtils.getRadians(a.x, a.y, b.x, b.y);
        out.set(v_scale * Math.cos(radian), v_scale * Math.sin(radian));
        return out;
    }


    /**
     * A点向B点移动
     * @param out a指向b 的向量
     * @param v_scale 向量倍速
     */
    static calVecTemp(a: Vec2, b: Vec2, v_scale: number, randowRadian: number = 0) {
        let radian = MathUtils.getRadians(a.x, a.y, b.x, b.y) + randowRadian;
        this.tempVec.set(v_scale * Math.cos(radian), v_scale * Math.sin(radian));
        return this.tempVec;
    }

    /**
     * A点向B点移动
     * 计算线段与多边形相交的平行向量
     * @returns 如果相交则返回修正后的最终位置；不相交返回null;
    */
    static getPloyParallelVec(pointA: Vec2, pointB: Vec2, ploy: { x: number, y: number }[]): Vec2 {
        if (ploy.length < 3) return null;

        let len = ploy.length;
        let prevIdx = len - 1;
        for (let idx = 0; idx < len; idx++) {
            if (MathUtils.segmentsIntersectFast(pointA, pointB, ploy[prevIdx], ploy[idx])) {
                let radian: number;
                let angle = MathUtils.calAngleBetweenSegments(pointA, pointB, ploy[prevIdx], ploy[idx]);
                if (angle < 80) {
                    radian = MathUtils.getRadians(ploy[prevIdx].x, ploy[prevIdx].y, ploy[idx].x, ploy[idx].y);
                } else if (angle > 100) {
                    radian = MathUtils.getRadians(ploy[idx].x, ploy[idx].y, ploy[prevIdx].x, ploy[prevIdx].y);
                    angle = 180 - angle;
                } else {
                    return null;
                }

                let dis = MathUtils.distance(pointA, pointB);
                let v = dis// * (90 - angle) / 90;
                this.tempVec.set(pointA.x + v * Math.cos(radian), pointA.y + v * Math.sin(radian));
                // this.tempVec.set(pointA.x + v, pointA.y + v);

                // BattleDebugManager.ins().showLine(ploy[prevIdx] as Vec2, ploy[idx] as Vec2)

                return this.tempVec
            }
            prevIdx = idx;
        }

        return null;
    }

    /**
     * A点向B点移动
     * 计算线段与多边形相交的平行向量
     * @returns 如果相交则返回修正后的速度；不相交返回null;
    */
    static getPloyParallelMoveVec(pointA: Vec2, pointB: Vec2, ploy: { x: number, y: number }[]): Vec2 {
        if (ploy.length < 3) return null;

        let len = ploy.length;
        let prevIdx = len - 1;
        for (let idx = 0; idx < len; idx++) {
            if (MathUtils.segmentsIntersectFast(pointA, pointB, ploy[prevIdx], ploy[idx])) {
                let radian: number;
                let angle = MathUtils.calAngleBetweenSegments(pointA, pointB, ploy[prevIdx], ploy[idx]);
                if (angle < 90) {
                    radian = MathUtils.getRadians(ploy[prevIdx].x, ploy[prevIdx].y, ploy[idx].x, ploy[idx].y);
                } else if (angle > 90) {
                    radian = MathUtils.getRadians(ploy[idx].x, ploy[idx].y, ploy[prevIdx].x, ploy[prevIdx].y);
                    angle = 180 - angle;
                }
                else {
                    return null;
                }

                let dis = MathUtils.distance(pointA, pointB);
                let v = dis// * (90 - angle) / 90;
                this.tempVec.set(v * Math.cos(radian), v * Math.sin(radian));
                // BattleDebugManager.ins().showLine(ploy[prevIdx] as Vec2, ploy[idx] as Vec2)
                return this.tempVec
            }
            prevIdx = idx;
        }

        return null;
    }

}