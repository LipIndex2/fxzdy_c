import { Handler } from "../../../../../core/utils/Handler";
import ObjectUtils from "../../../../../core/utils/ObjectUtils";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { ITarget } from "../ITarget";
import { SkillBehavior } from "../SkillBehavior";

export class KaPiBaLaSkill2 extends FightSkillInfo {
    private interval: number = 0;
    private fightTimeCheck: FightTimeCheck
    private numIndex: number = 0;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string, time: number, num: number } = behavior.cfg.param;
        if (param?.buff) {
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner.caster as BattleUnit, behavior)
            if (behavior.selectUnits?.length) {
                for (let i = 0; i < behavior.selectUnits.length; i++) {
                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, behavior.selectUnits[i], behavior)
                }
            }
        }
        else if (param?.time) {
            this.interval = Math.ceil(param.time / param.num)
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(this.interval, Handler.create(this, this.checkNextTime, [behavior, owner], false), param.num, true)
        }
    }

    public missile(behavior: SkillBehavior, effectParam: { missileId: string, fix?: number, fiy?: number, exData?: any, notAtkPoint?: number, staticPos?: { x: number, y: number } }, caster: ICaster, takers: ITarget[] | ITarget) {
        if (this.numIndex % 2 == 0) {
            let newParam: { missileId: string, fix: number, fiy: number } = ObjectUtils.copy(effectParam) as any;
            newParam.fix = 70;
            newParam.fiy = 20;
            super.missile(behavior, newParam, caster, takers)
        }
        else
            super.missile(behavior, effectParam, caster, takers)
    }

    private checkNextTime(behavior: SkillBehavior, owner: ICaster): void {
        this.numIndex++;
        super.beginBehaviorEffect(behavior, owner)
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { addDamage: number } = behavior.cfg.param;
        if (param?.addDamage) {
            damageVo.value = Math.ceil(damageVo.value * (1 + (1 - taker.hpPercen)));
        }
        super.hurtHandler(behavior, taker, damageVo)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }
    }
}