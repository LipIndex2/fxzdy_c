import { Graphics } from "cc";
import { TableManager } from "../../../core/table/TableManager";
import { MathUtils } from "../../../core/utils/MathUtils";
import GIns from "../../GIns";
import { BattleUtils } from "./BattleUtils";
import { FightTimeCheck } from "./FightTimeCheck";
import { ICaster } from "./skill/ICaster";
import { PointTarget } from "./skill/PointTarget";
import { SkillBehavior } from "./skill/SkillBehavior";
import { TargetFaction } from "./skill/SkillEnum";
import { SkillUtils } from "./skill/SkillUtils";
import { Vec2 } from "cc";
import { GunGroupInfo } from "./GunGroupInfo";
import { v2 } from "cc";

export class GunInfo extends FightTimeCheck {
    public groupInfo?: GunGroupInfo
    public id: string
    public cfg: table.battle.GunConfig
    public behavior: SkillBehavior
    public caster: ICaster
    /***循环帧数 */
    public loopTime: number = 0;
    public fix: number = 0;
    public fiy: number = 0;
    public notAtkPoint: number = 0;
    public notHurtPoint: number = 0;
    public cooldown: number = 0
    public missileId: string;
    /**静止坐标的起始坐标 */
    public staticStarPos: { x: number, y: number }
    /**静止坐标的目标坐标 */
    public staticTargetPos: { x: number, y: number }
    /**设置外部的坐标 */
    public setOutPos: { x: number, y: number }

    public init(id: string, behavior: SkillBehavior, caster: ICaster, effectParam?: { group: string, fix?: number, fiy?: number, notAtkPoint?: number, notHurtPoint?: number }): void {
        this.id = id;
        this.cfg = TableManager.getDataById(table.battle.GunConfig, id);
        this.behavior = behavior;
        this.caster = caster;
        this.missileId = this.groupInfo.cfg.missileId || this.cfg.missileId;
        this.notAtkPoint = effectParam.notAtkPoint || 0;
        this.notHurtPoint = effectParam.notHurtPoint || 0;
        this.delay = BattleUtils.getFrameByTime(this.cfg.preCooldown || 0);
        let clip = this.cfg.clip || 1;
        this.cooldown = BattleUtils.getFrameByTime(this.cfg.cooldown || 0)
        this.maxTime = (clip) * this.cooldown;

        this.fix = effectParam.fix || 0;
        this.fiy = effectParam.fiy || 0;

        this.staticStarPos = this.notAtkPoint ? this.caster.pos : this.caster.atkPoint;
        if (this.behavior?.skillTarget) {
            this.staticTargetPos = v2(this.behavior.skillTarget.hurtPoint.x, this.behavior.skillTarget.hurtPoint.y)
            if (this.notHurtPoint) {
                this.staticTargetPos = v2(this.behavior.skillTarget.pos.x, this.behavior.skillTarget.pos.y);
            }
        }
        else {
            this.staticTargetPos = v2(this.staticStarPos.x, this.staticStarPos.y)
        }
    }

    /**触发 */
    protected triggerHandler(): void {
        if (this.loopTime > 0) {
            this.loopTime--;
        }

        if (this.loopTime == 0) {
            this.loopTime = this.cooldown;
            //触发
            this.action()
        }
    }

    public action(): void {
        if (this.isReadyToRemove)
            return

        let atkPos = this.getAtkPos()
        let gunStartPos = this.getGunStartPos();

        // let initX = this.fix + this.cfg.posX * 0.01;
        // let initY = this.fiy + this.cfg.posY * 0.01;
        // let anglePos = MathUtils.getCoordinates(this.cfg.rotation, 300)
        // let x = anglePos.x + gunStartPos.x;
        // let y = anglePos.y + gunStartPos.y;
        let pointTarget = this.getGunAnglePos()
        // pointTarget.teamId = SkillUtils.getTeamIdByFaction(this.caster.teamId, TargetFaction.EnemySide);
        // pointTarget.setPoint(atkPos.x + x, atkPos.y + y);
        this.behavior.skill.fightSkillInfo.missile(this.behavior, { missileId: this.missileId, fix: gunStartPos.x, fiy: gunStartPos.y, notAtkPoint: this.notAtkPoint ? 1 : 0, staticPos: this.groupInfo.cfg.atkPosType == 0 ? atkPos : null }, this.caster, pointTarget);
    }

    /***单位的攻击点 */
    public getAtkPos(): { x: number, y: number } {
        let atkPos = this.notAtkPoint ? this.caster.pos : this.caster.atkPoint;
        if (this.groupInfo.cfg.atkPosType == 0) {
            //静止坐标
            atkPos = this.staticStarPos;
        }
        else if (this.groupInfo.cfg.atkPosType == 2) {
            //跟随移动
        }
        else if (this.groupInfo.cfg.atkPosType == 3) {
            //随机坐标
            //radiusX:500;radiusY:300
            if (!this.setOutPos) {
                let atkPosParm: { radiusX: number, radiusY: number } = this.groupInfo.cfg.atkPosParm;
                let xy = MathUtils.getRandomPointInEllipse(atkPosParm.radiusX, atkPosParm.radiusY, atkPos.x, atkPos.y, this.caster.battleLogic.randomMgr.seedRandom())
                atkPos = v2(xy.x, xy.y)
            }
            else {
                atkPos = this.setOutPos;
            }
        }
        return atkPos;
    }

    /***单位的弹道坐标 */
    public getGunStartPos(): { x: number, y: number } {

        let initX = this.fix + this.cfg.posX * 0.01;
        let initY = this.fiy + this.cfg.posY * 0.01;

        let atkPos = this.getAtkPos()
        //计算和目标点的旋转角度
        let angle = MathUtils.getAngle(atkPos.x, atkPos.y, this.staticTargetPos.x, this.staticTargetPos.y);
        let rotatPos = MathUtils.rotateCoordinates(initX, initY, angle)

        return { x: rotatPos.x, y: rotatPos.y }
    }

    /***单位的弹道方向目标 */
    public getGunAnglePos(): PointTarget {
        let atkPos = this.getAtkPos()
        let gunStartPos = this.getGunStartPos();


        //计算和目标点的旋转角度
        let angle = MathUtils.getAngle(atkPos.x, atkPos.y, this.staticTargetPos.x, this.staticTargetPos.y);

        let anglePos = MathUtils.getCoordinates(this.cfg.rotation + angle, 300)
        let x = anglePos.x + gunStartPos.x;
        let y = anglePos.y + gunStartPos.y;
        let pointTarget = new PointTarget(this.caster.battleLogic)
        pointTarget.teamId = SkillUtils.getTeamIdByFaction(this.caster.teamId, TargetFaction.EnemySide);

        if (this.cfg.isStop)
            pointTarget.setPoint(atkPos.x + gunStartPos.x, atkPos.y + gunStartPos.y);
        else
            pointTarget.setPoint(atkPos.x + x, atkPos.y + y);

        return pointTarget
    }

    public destoryTimeCheck(): void {
        super.destoryTimeCheck()
        this.isReadyToRemove = true;
    }
}