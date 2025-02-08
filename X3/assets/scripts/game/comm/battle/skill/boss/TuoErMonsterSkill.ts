import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { BulletUnit } from "../../unit/bullet/BulletUnit";
import { BehaviorUtils } from "../BehaviorUtils";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";

export class TuoErMonsterSkill2 extends FightSkillInfo {
    /***公式计算的处理 */
    protected fightFormulaHandler(behavior: SkillBehavior, caster: BulletUnit, taker: BattleUnit): void {
        //amount:5000;
        let param: { amount: number } = behavior.cfg.param;
        if (param && param.amount) {
            let dis = MathUtils.distance(behavior.skill.owner.pos, taker.pos);
            // let radius = +behavior.cfg.rangeParam.radius;
            let disPer = Math.min(dis / caster.cfg.distance, 1);
            let value = Math.floor(Math.min(param.amount * disPer, +param.amount))
            behavior.tempAddDamageValue += value;
        }
        super.fightFormulaHandler(behavior, caster, taker)
    }
}

export class TuoErMonsterSkill3 extends FightSkillInfo {
    private fightTimeCheckaArr: FightTimeCheck[] = []
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { value: number, dis: number } = behavior.cfg.param;
        if (param?.dis) {
            if (this.selectUnits) {
                for (let i = 0; i < this.selectUnits.length; i++) {
                    if (this.selectUnits[i].isActive) {
                        if (MathUtils.distance(this.selectUnits[i].pos, owner.pos) > param.dis) {
                            let angle = MathUtils.angle(this.selectUnits[i].pos, owner.pos) + 180
                            let tempPos = MathUtils.getCoordinates(angle, param.dis)
                            let fightTimeCheck = BehaviorUtils.pull(owner.pos.x + tempPos.x, owner.pos.y + tempPos.y, param.value * 1000 / BattleUtils.frameDeltaMs / 10, 16, 0, this.selectUnits[i], 10)
                            if (fightTimeCheck)
                                this.fightTimeCheckaArr.push(fightTimeCheck)
                        }
                    }
                }
            }
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        for (let i = 0; i < this.fightTimeCheckaArr.length; i++) {
            this.fightTimeCheckaArr[i].isReadyToRemove = true;
        }
        this.fightTimeCheckaArr.length = 0;
    }
}