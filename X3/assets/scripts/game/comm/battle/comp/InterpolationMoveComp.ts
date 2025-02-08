import { v2 } from "cc";
import { Vec2 } from "cc";
import { Handler } from "../../../../core/utils/Handler";
import { BattleUtils } from "../BattleUtils";
import { TimeManager } from "../../../../core/time/TimeManager";

/***插值移动组件 */
export class InterpolationMoveComp {
    /***上1个坐标点 */
    private lastVec2: Vec2 = v2();
    /***下1个坐标点 */
    private nextVec2: Vec2 = v2();
    /***当前坐标点 */
    public nowVec2: Vec2 = v2();
    /***当前的速度向量 */
    private moveVec2: Vec2 = v2(0, 0)
    /***每帧的距离 */
    private moveDis: number = 0;
    private isFirstXy: boolean = true;
    private tickFrame: number = 0;

    private callback: Handler;

    public constructor (tickFrame: number, callback: Handler) {
        this.tickFrame = tickFrame;
        this.callback = callback;
    }

    public stop(pos: Vec2 = null): void {
        this.moveVec2.set(0, 0)
        this.moveDis = 0;
        this.isFirstXy = true
        if (pos) {
            this.lastVec2.set(pos.x, pos.y)
            this.nowVec2.set(pos.x, pos.y)
            this.nextVec2.set(pos.x, pos.y)
        }
    }

    public update(pos: Vec2, type: number = 0, forceMove: boolean = false): void {
        if (this.nextVec2.x == pos.x && this.nextVec2.y == pos.y) {
            //相同则相当于逻辑帧没有变化
            if (this.moveVec2.x == 0 && this.moveVec2.y == 0) {
                return
            }
            const dx2 = this.nextVec2.x - this.nowVec2.x;
            const dy2 = this.nextVec2.y - this.nowVec2.y;
            const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (this.moveDis != 0 && distance > this.moveDis) {
                // 更新目标A的位置
                const newX = this.nowVec2.x + this.moveVec2.x;
                const newY = this.nowVec2.y + this.moveVec2.y;
                this.nowVec2.set(newX, newY)
                this.callback.runWith([newX, newY])
            }
            else {
                // this.moveVec2.set(0, 0)
                this.stop()
            }
        }
        else {
            let b = true;
            if (type == 1) {
                if (this.nowVec2.x != 0 || this.nowVec2.y != 0) {
                    if (Math.abs(Math.floor(pos.x - this.nowVec2.x)) > 5 || Math.abs(Math.floor(pos.y - this.nowVec2.y)) > 5) {
                        b = false
                    }
                }
            }

            if ((b && this.isFirstXy) || this.tickFrame == 1 || forceMove) {
                this.lastVec2.set(pos.x, pos.y)
                this.nowVec2.set(pos.x, pos.y)
                this.callback.runWith([pos.x, pos.y])
                this.isFirstXy = false;
            }
            else {
                this.lastVec2.set(this.nextVec2.x, this.nextVec2.y)
                this.nowVec2.set(this.lastVec2.x, this.lastVec2.y)
                this.callback.runWith([this.lastVec2.x, this.lastVec2.y])
            }

            this.nextVec2.set(pos.x, pos.y)

            let dx = this.nextVec2.x - this.lastVec2.x;
            let dy = this.nextVec2.y - this.lastVec2.y;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 1) {
                let stepX = dx / this.tickFrame;
                let stepY = dy / this.tickFrame;

                let timeScale = TimeManager.frameDeltaMs / BattleUtils.frameDeltaMs * this.tickFrame;
                stepX *= timeScale
                stepY *= timeScale;

                this.moveDis = distance / this.tickFrame;
                this.moveDis *= timeScale;

                this.moveVec2.set(stepX, stepY)
            }
            else {
                this.moveVec2.set(0, 0)
            }
        }
    }
}