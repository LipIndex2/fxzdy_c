import { MathUtils } from "db://assets/scripts/core/utils/MathUtils";
import { BattleUtils } from "../../../BattleUtils";
import { DamageVo } from "../../../DamageVo";
import { BattleUnit } from "../BattleUnit";
import { BattleUnitComp } from "./BattleUnitComp";
import { Vec2 } from "cc";

export class MonsterEcapeComp extends BattleUnitComp {
    public ecapeTime: number = 0;
    public nowEcapeTime: number = 0;
    public esapeHurtNum: number = 0;
    public nowEsapeHurtNum: number = 0;
    public esapeMoveSpeed: number = 0;
    /***逃跑中 */
    public esapeing: boolean = false;
    /***逃跑移动中 */
    public esapeMoveing: boolean = false;
    public moveVec: Vec2 = new Vec2();
    public constructor (unit: BattleUnit, ecapeTime: number, esapeHurtNum: number, esapeMoveSpeed: number) {
        super(unit);
        this.nowEcapeTime = this.ecapeTime = BattleUtils.getFrameByTime(ecapeTime);
        this.nowEsapeHurtNum = this.esapeHurtNum = esapeHurtNum;
        this.esapeMoveSpeed = esapeMoveSpeed;
    }

    public update(): void {
        if (this.esapeMoveing) {
            if (this.nowEcapeTime > 0)
                this.nowEcapeTime--

            if (this.nowEcapeTime == 0) {
                this.nowEcapeTime = this.ecapeTime;
                this.nowEsapeHurtNum = this.esapeHurtNum;
                this.esapeMoveing = false;
            }
            else {
                this.owner.setMoveVec(this.moveVec)
            }
        }
    }

    public get moveSpeed(): number {
        return this.esapeMoveSpeed / 1000;
    }

    public hurt(damageVo: DamageVo): void {
        if (this.esapeMoveing || !damageVo || !damageVo.caster || damageVo.caster.teamId == this.owner.teamId)
            return
        this.nowEsapeHurtNum--;
        if (this.nowEsapeHurtNum <= 0) {
            this.nowEsapeHurtNum = 0;
            //触发逃跑
            this.esapeing = true;
            this.esapeMoveing = true;

            //获取速度方向
            let targetTeamPos = this.owner.battleLogic.getTeamPosByTeamId(damageVo.caster.teamId);
            let radians = MathUtils.getRadians(this.owner.pos.x, this.owner.pos.y, targetTeamPos.x, targetTeamPos.y);
            // 计算反方向的弧度
            let oppositeRadians = radians + Math.PI;
            // 由于弧度是周期性的，所以我们可能需要规范化这个值到 -π 到 π 的范围内
            oppositeRadians = (oppositeRadians + Math.PI) % (2 * Math.PI) - Math.PI;
            this.moveVec.set(this.moveSpeed * Math.cos(oppositeRadians), this.moveSpeed * Math.sin(oppositeRadians));
        }
    }
}