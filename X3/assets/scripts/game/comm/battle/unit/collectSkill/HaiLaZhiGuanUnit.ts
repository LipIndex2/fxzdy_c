import { PoolManager } from "../../../../../core/pool/PoolManager";
import { Handler } from "../../../../../core/utils/Handler";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import { ExSkillData } from "../../skill/ExSkillData";
import { FightSkillInfo } from "../../skill/FightSkillInfo";
import { ICaster } from "../../skill/ICaster";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { AbnormalType } from "../../skill/SkillEnum";
import { BattleUnit } from "../battle/BattleUnit";

export class HaiLaZhiGuanSkill extends FightSkillInfo {
    private timerCheck: FightTimeCheck;
    private target: BattleUnit;

    /***技能开始 */
    public beginSkillHandler(): void {
        this.removeTarget()
        if (this.timerCheck)
            this.timerCheck.isReadyToRemove = true;
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let skill = behavior.skill as ExSkillData;
        behavior.skillTarget = skill.selectTarget
        super.beginBehaviorEffect(behavior, owner)
        let param: { time: number, buff: string } = behavior.cfg.param;
        if (param?.time) {
            this.target = skill.selectTarget;
            this.target.setAbnormalStatus(AbnormalType.Invincible);//添加无敌
            this.target.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, this.target, behavior)
            this.timerCheck = owner.battleLogic.createTimeCheck(param.time, new Handler(this, this.onTimeComplete))
        }
    }

    private onTimeComplete(): void {
        this.removeTarget()
    }

    private removeTarget(): void {
        if (this.target) {
            this.target.clearAbnormalStatus(AbnormalType.Invincible);
            let damageVo = PoolManager.getItem(DamageVo)
            damageVo.skillInfo = this.skill;
            damageVo.caster = this.skill.owner;
            damageVo.target = this.target;
            damageVo.status = BattleConstantConfig.Normal;
            damageVo.value = this.target.hp;
            this.target.hurt(damageVo)
        }
        this.target = null;
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        super.skillCompleteHandler()
        if (this.timerCheck)
            this.timerCheck.isReadyToRemove = true;
    }
}