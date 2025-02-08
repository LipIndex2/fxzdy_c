import { DamageVo } from "../../DamageVo";
import { DirctionType } from "../../enum/BattleEnum";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { BulletUnit } from "../../unit/bullet/BulletUnit";
import { SkillData } from "../SkillData";

export class MaErSiMonsterShow extends MonsterShowUnit {
    /***攻击完成 */
    protected attackActionComplete(isForce: boolean, skillInfo: SkillData, isStopSkillEffect: boolean = true): void {
        if (isForce && skillInfo?.skillIndex == 2) {
            this.skillEffectGoToAndPlay("loopEnd")
            super.attackActionComplete(isForce, skillInfo, false)
        }
        else
            super.attackActionComplete(isForce, skillInfo, isStopSkillEffect)
    }
}

export class MaErSiMonster extends MonsterUnit {
    public isSkill3: boolean = false;
    checkBeHurtHandler(damageVo: DamageVo): boolean {
        if (this.isSkill3 && damageVo.caster instanceof BulletUnit) {
            //3技能免疫正面的子弹伤害
            if (damageVo.caster.moveVec.x < 0 && this.dirction == DirctionType.Left) {
                return false
            }
            else if (damageVo.caster.moveVec.x > 0 && this.dirction == DirctionType.Rigth) {
                return false
            }
            return true
        }
        else
            return super.checkBeHurtHandler(damageVo);
    }
}