import { SortUtils } from "../../../../core/utils/SortUtils";
import { AttrData } from "../../attr/AttrManager";

export class WeaponVo {
    base: Vo.awakeweapon.AwakeWeaponVo
    cfg: table.awakeweapon.AwakeWeaponConfig
    itemCfg: table.item.ItemConfig
    attrs: AttrData[];
    nextAttrs: AttrData[];
    skillList: Array<{ k: any, v: any }>

    /***获取当前的技能列表 */
    public getSkillId(): string {
        let skillId: string;
        if (this.cfg.skillInfo) {
            if (!this.skillList)
                this.skillList = SortUtils.sortBy2(this.cfg.skillInfo, ["k"], [true], true)
            for (let i = 0; i < this.skillList.length; i++) {
                if (this.skillList[i].k <= this.base.star) {
                    skillId = this.skillList[i].v;
                }
                else {
                    break;
                }
            }
        }
        return skillId;
    }

    /***通过星级获取该技的技能 */
    public getSkillByStar(star: number): string {
        if (this.cfg.skillInfo) {
            if (!this.skillList)
                this.skillList = SortUtils.sortBy2(this.cfg.skillInfo, ["k"], [true], true)
            for (let i = 0; i < this.skillList.length; i++) {
                if (this.skillList[i].k == star) {
                    return this.skillList[i].v;
                }
            }
        }
        return null;
    }
}