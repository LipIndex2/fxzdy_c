import { TableManager } from "../../../../core/table/TableManager";
import { AttrEnum } from "../attribute/AttrEnum";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { SkillBuff } from "../skill/SkillBuff";
import { BattleUnit } from "../unit/battle/BattleUnit";

export class AttrValueBuff extends SkillBuff {
    public attr: { [attrId: number]: number }
    public setData(data: BattleUnit): void {
        this.attr = {}
        let effectParm1: { amount: number, type: string[], isFighter: number } = this.effectParm1;
        if (!data) {
            if (effectParm1.isFighter) {
                data = this.caster?.caster;
            }
        }

        if (!data) {
            return
        }

        for (let i = 0; i < effectParm1.type.length; i++) {
            let attrCfg = TableManager.getDataById(table.battle.AttributeConfig, effectParm1.type[i]);
            let value = data.getAttrValue(attrCfg.tid) * effectParm1.amount / BattleConstantConfig.getRandBase;
            if (attrCfg.tid == AttrEnum.ATK) {
                this.attr[AttrEnum.ATK_INC] = effectParm1.amount;
            }
            else if (attrCfg.tid == AttrEnum.DEF) {
                this.attr[AttrEnum.DEF_INC] = effectParm1.amount;
            }
            else
                this.attr[attrCfg.tid] = Math.floor(value);
        }
    }

    /**提取需要克隆的字段 */
    public getCloneData(): any {
        if (this.cfg.layer > 0)
            return this.attr;
        else
            return null;
    }

    /**设置需要克隆的字段 */
    public setCloneData(data: { [attrId: number]: number }): void {
        if (data && (this.cfg.layer == 0 || this.layer <= this.cfg.layer)) {
            for (let attrId in data) {
                if (!this.attr[attrId])
                    this.attr[attrId] = 0;
                this.attr[attrId] += data[attrId]
            }
        }
    }
}