import { SkillHalo } from "../skill/SkillHalo";

/***
 * 添加BUFF的光环
 */
export class AddBuffHalo extends SkillHalo {
    protected haloHandler(): void {
        let effectParam: { buff: string } = this.effectParm1;
        if (effectParam) {
            for (let i = 0; i < this.units.length; i++) {
                if (!this.units[i].isDeath) {
                    this.caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff, this.caster, this.units[i], this.skillBehavior)
                }
            }
        }
    }
}