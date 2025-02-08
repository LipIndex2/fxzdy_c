import { AttrEnum } from "../attribute/AttrEnum";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBehavior } from "../skill/SkillBehavior";
import { SkillBuff } from "../skill/SkillBuff";
import { AbnormalType, TargetFaction } from "../skill/SkillEnum";
import { SkillUtils } from "../skill/SkillUtils";
import { ISummonData } from "../unit/battle/ISummonData";

/***
 * 束缚BUFF,自身无法行动，且要被队友击破身上的束缚血量才能解除
 */
export class TieBuff extends SkillBuff {
    private hp: number = 0;
    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam?.amount) {
            let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, effectParam.amount * this.layer, this.distance)
            damageVo.buffInfo = this;
            this.caster.battleLogic.hurt(damageVo)
        }
    }

    public onAddBuff(): void {
        this.target.setAbnormalStatus(AbnormalType.NotMove)
        this.target.setAbnormalStatus(AbnormalType.NotAttack)
        let effectParam: { hp: number, id: number } = this.effectParm1;
        if (effectParam?.hp) this.hp = effectParam.hp;

        let attr = {};
        attr[AttrEnum.HP] = this.hp * this.caster.atk / BattleConstantConfig.getRandBase;
        let summonData: ISummonData = {
            isSummon: true,
            attr: attr,
            byUid: this.target.uid,
            possess: this.id,
        }
        this.battleLogic.createMonster(effectParam.id, this.target.pos.x, this.target.pos.y, SkillUtils.getTeamIdByFaction(this.target.teamId, TargetFaction.EnemySide), this.target.dirction, 1, summonData);
    }

    public remove(): void {
        if (this.time >= this.totalMaxTime) {
            let effectParam: { behavior: string } = this.effectParm1;
            if (effectParam) {
                if (!this.caster) {
                    return;
                }

                const newBehavior = SkillBehavior.createBehavior(effectParam.behavior, 0, this.skillBehavior?.skill);
                if (newBehavior) {
                    newBehavior.index = 0;
                    newBehavior.setCaster(this.caster)
                    newBehavior.skillTarget = this.target;
                    newBehavior.skillTargetUid = this.target.uid
                    newBehavior.actionEffect();
                }
            }
        }

        let summons = this.battleLogic.unitProcessor.getSummons()
        for (let i = 0; i < summons.length; i++) {
            if (summons[i].summon.byUid == this.target.uid) {
                summons[i].dispose();
            }
        }
        this.target.clearAbnormalStatus(AbnormalType.NotMove)
        this.target.clearAbnormalStatus(AbnormalType.NotAttack)
        super.remove()
    }
}