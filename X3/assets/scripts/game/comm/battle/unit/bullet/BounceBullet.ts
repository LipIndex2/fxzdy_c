import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { SkillTargetType, TargetFaction } from "../../skill/SkillEnum";
import { SkillUtils } from "../../skill/SkillUtils";
import { BattleUnit } from "../battle/BattleUnit";
import BulletFactory from "./BulletFactory";
import { BulletUnit } from "./BulletUnit";


/**弹射弹道 */
export class BounceBullet extends BulletUnit {
    /***弹射次数 */
    public bouncelTimes: number;
    /***弹射总次数 */
    public bouncelMaxTimes: number;
    /***每次弹射的目标数 */
    private num: number;
    /***索敌范围 */
    private range: number;
    /***索敌类型 */
    private targetType: SkillTargetType
    /***特殊处理 1，最后1下回到攻击者 */
    private exType: number
    /***击中的实体 */
    public hitUnitMap: { [uid: number]: boolean }
    /***目标弹道ID */
    private missile: string;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;
        let parameter: { times: number, num: number, missile: string, range: number, targetType: SkillTargetType, exType: number } = this._cfg.parameter;
        this.bouncelMaxTimes = +parameter.times || 0;
        this.bouncelTimes = 0;
        this.exType = parameter.exType;
        this.targetType = parameter.targetType || SkillTargetType.Nearset;
        this.range = +parameter.range || 300;
        this.num = +parameter.num || 1;
        this.missile = parameter.missile;
        this.hitUnitMap = {};

        this.target = target

        this._startVec.set(atkPoint.x, atkPoint.y);
        this.pos.set(atkPoint.x, atkPoint.y);

        let radians = MathUtils.getRadians(this._pos.x, this._pos.y, targetPos.x, targetPos.y);
        let angle = MathUtils.radians2Angle(radians);
        this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });

        this._moveVec.set(this.moveSpeed * Math.cos(radians), this.moveSpeed * Math.sin(radians));
        let dis = MathUtils.getDistance(this.pos.x, this.pos.y, targetPos.x, targetPos.y) - 10;

        this._maxTime = BattleUtils.getFrameByTime(dis / this.moveSpeed);
    }

    action() {
        this._isActive = false;
        this.actionBehavior();
        let target = this.battleLogic.getBatteUintByUid(this.targetUid);
        if (!target)
            return
        this.hitUnitMap[target.uid] = true;
        if (this.bouncelTimes >= this.bouncelMaxTimes) {
            if (this.exType == 1) {
                //无目标回到攻击者手上
                this.exHandler()
            }
            return
        }
        this.hit(target)
        this.onHit(target);
    }

    protected onHit(target: BattleUnit): void {
        let targetType = this._cfg.parameter["targetType" + (this.bouncelTimes + 1)] || this.targetType;
        let takers = SkillUtils.skillTarget(targetType, TargetFaction.EnemySide, targetType == SkillTargetType.SELF ? this.caster : this, null, this.range, 99999)
        if (takers) {
            this.bouncelTimes++
            let num = 0;
            for (let i = 0; i < takers.length; i++) {
                if (this.hitUnitMap[takers[i].uid]) {
                    continue;
                }

                if (num >= this.num) {
                    break;
                }
                this.createBulle(takers[i])
                num++;
            }
            if (num > 0) {
                return
            }
        }

        if (this.exType == 1) {
            //无目标回到攻击者手上
            this.exHandler()
        }
    }

    protected createBulle(taker: BattleUnit): BulletUnit {
        let missile = this._cfg.parameter["missile" + this.bouncelTimes] || this.missile;
        let unit = BulletFactory.createBulletUnit(missile, this.teamId, this.targetTeamId, this.fightType, this.caster);
        unit.behavior = this.behavior;
        unit.skill = this.skill;
        unit.initParam(this.atk, taker.hurtPoint, this.target.hurtPoint, this, taker);
        unit.casterUid = this.casterUid;
        unit.targetUid = taker.uid;
        this.battleLogic.unitProcessor.addBullet(unit);
        if (unit instanceof BounceBullet) {
            //同1个弹射弹道的话，传递连锁次数
            unit.bouncelTimes = this.bouncelTimes;
            unit.hitUnitMap = this.hitUnitMap;
        }
        return unit
    }

    protected exHandler(): void {
        if (this.exType == 1) {
            //无目标回到攻击者手上
            this.missile = this._cfg.parameter.exParm[0];
            this.createBulle(this.caster);
        }
    }
}