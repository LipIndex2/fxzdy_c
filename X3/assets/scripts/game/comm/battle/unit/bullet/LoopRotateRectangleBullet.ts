import { v2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { SkillData } from "../../skill/SkillData";
import { BulletUnit } from "./BulletUnit";
import { BulletShowUnit } from "../../show/BulletShowUnit";
import { WorldManager } from "../../../world/WorldManager";
import { BattleUnit } from "../battle/BattleUnit";

export class LoopRotateRectangleBulletShow extends BulletShowUnit {
    public unitData: LoopRotateRectangleBullet;

    public changeLayer(): void {
        if (this._spineNode?.isValid) {
            let angle = MathUtils.normalizeAngle(this._spineNode.angle)
            if (angle > 0 && angle < 180) {
                WorldManager.ins().effectLayer.addChild(this._spineNode);
            }
            else {
                WorldManager.ins().roleLayer.addChild(this._spineNode);
            }
        }
    }
}


/**持续的直线弹道 */
export class LoopRotateRectangleBullet extends BulletUnit {
    private interval: number = 0;
    private initInterval: number = 0;
    private speed: number = 0;
    private casterPoint: { x: number, y: number }
    private targetAngle: number = 0
    private nowAngle: number = 0;
    private radius: number = 0;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;
        let parameter: { width: number, interval: number, radius: number } = this._cfg.parameter;
        this.interval = 0;
        this.initInterval = BattleUtils.getFrameByTime(parameter.interval || 0);
        this.speed = this._cfg.speed / 1000;
        this.radius = parameter.radius
        this.casterPoint = v2(atkPoint.x, atkPoint.y)
        this.nowAngle = MathUtils.getAngle(atkPoint.x, atkPoint.y, targetPos.x, targetPos.y);
        // this.targetAngle = 90// MathUtils.getAngle(atkPoint.x, atkPoint.y, targetPos.x, targetPos.y);
        // let p = MathUtils.getCoordinates(this.targetAngle + 180, parameter.radius)

        this.target = target;
        this.targetUid = this.target.uid;

        this.updatePos();
        this._maxTime = BattleUtils.getFrameByTime(this._cfg.timeLimit);
    }

    protected updatePos(): void {
        this.nowAngle += this.speed;
        let ellipsePoint = MathUtils.getEllipsePoint(this.nowAngle, this.radius, this.radius, this.casterPoint.x, this.casterPoint.y)

        this.pos.set(ellipsePoint.x, ellipsePoint.y);

        let p = MathUtils.getCoordinates(this.nowAngle, this._cfg.distance)
        this.target.pos.set(ellipsePoint.x + p.x, ellipsePoint.y + p.y)

        this.battleLogic.showMgr.setStatue(this.uid, { angle: this.nowAngle + 180 });
        this.showUnit()?.changeLayer()
        this.showUnit()?.setHitTipsCompTargetPos(this.casterPoint, this.nowAngle)
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): LoopRotateRectangleBulletShow {
        return this.battleLogic.showMgr.getUnit(this.uid) as LoopRotateRectangleBulletShow;
    }

    /**检测是否触发 */
    checkTrigger() {
        if (!this.caster) {
            this._isActive = false;
            return
        }

        this.updatePos();

        if (this.caster instanceof BattleUnit && !this.caster.skillInfo) {
            this._isActive = false;
            return
        }

        if (this.interval <= 0) {
            this.action();
            this.interval = this.initInterval
        }
        this.interval--;

        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
    }

    action() {
        this.actionBehavior();
    }
}