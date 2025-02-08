import { Vec2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { BulletShowUnit } from "../../show/BulletShowUnit";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { BattleUnit } from "../battle/BattleUnit";
import { BounceBullet } from "./BounceBullet";
import { BulletUnit } from "./BulletUnit";

export class StretchBounceBulletShow extends BulletShowUnit {
    public unitData: StretchBounceBullet;

    protected onSpineLoaded(): void {
        super.onSpineLoaded()
        this.updateScale();
    }

    protected updateScale(): void {
        let dis = MathUtils.getDistance(this.unitData.targetPos.x, this.unitData.targetPos.y, this.unitData.startVec.x, this.unitData.startVec.y)
        this._spineNode.setScale(dis / this.unitData.bulletWidth, 1)
    }
}

/**闪电链弹道 */
export class StretchBounceBullet extends BounceBullet {
    private delay: number;
    public bulletWidth: number
    public targetPos: { x: number, y: number }
    private isHurt: boolean = false;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        super.initParam(atk, targetPos, atkPoint, from, target)
        this.isHurt = false;
        this.targetPos = targetPos

        let parameter: { width: number, delay?: number } = this._cfg.parameter;
        this.bulletWidth = parameter.width;
        this.delay = BattleUtils.getFrameByTime(parameter.delay || 0);
    }

    get startVec(): Vec2 {
        return this._startVec
    }


    /**检测是否触发 */
    checkTrigger() {
        if (this.isHurt) {
            if (this._runTime >= this._maxTime) {
                this._isActive = false;
            }
            return
        }

        this.delay = Math.max(0, this.delay - 1)
        if (!this.delay) {
            this.isHurt = true;
            //触发后
            this.action();
        }
    }

    protected createBulle(taker: BattleUnit): BulletUnit {
        let bullet = super.createBulle(taker)
        if (bullet instanceof StretchBounceBullet) {
            bullet.bouncelTimes = this.bouncelTimes;
            bullet.hitUnitMap = this.hitUnitMap;
        }
        return bullet;
    }
}