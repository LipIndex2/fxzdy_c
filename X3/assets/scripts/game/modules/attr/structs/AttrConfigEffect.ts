import ObjectUtils from "db://assets/scripts/core/utils/ObjectUtils";
import G from "db://assets/scripts/core/comm/G";
import { Attribute } from "db://assets/scripts/game/modules/attr/AttrEnum";

/**
 * 属性配置效果
 * 在配置基础上, 扩展了 value 数值 + UI 显示的文本
 *
 *
 * @author luohaojun
 */
export class AttrConfigEffect {

    // 属性配置
    config: table.battle.AttributeConfig;
    // 数值
    value: number;

    static create(attrId: Attribute, value: number): AttrConfigEffect {
        const effect = new AttrConfigEffect();
        effect.config = G.TableManager.getDataById(table.battle.AttributeConfig, attrId) as table.battle.AttributeConfig;
        effect.value = value;
        return effect;
    }

    /**
     * 从配置中构造
     * demo = ATK_ADD:10;
     * @param attrConfig 属性配置 ATK_ADD 对应的 config
     * @param valueV 配置的值 | 10
     */
    static fromConfig(attrConfig: table.battle.AttributeConfig, valueV: any): AttrConfigEffect {
        const effect = new AttrConfigEffect();
        effect.config = attrConfig;
        if (valueV) {
            // 类型
            if (ObjectUtils.isNumber(valueV)) {
                effect.value = valueV as number
            } else if (ObjectUtils.isString(valueV)) {
                effect.value = Number.parseInt(valueV.toString()) as number
            } else {
                effect.value = 0;
            }
        } else {
            effect.value = 0;
        }
        return effect
    }

    get attrId(): Attribute {
        return this.config.id as Attribute;
    }

    /**
     * - 不带符号
     * get 统一的数值 UI 文本 
     * 
     * @param fractionDigits 保留多少位
     * @returns {string} 数值显示的文本
     */
    getValueStringForUIShow(fractionDigits: number = 2): string {
        const isNeedPercent = this.config.isPermyriad;
        if (isNeedPercent) {
            if (this.value != 0) {
                const showNumber = this.value / 100;
                return `${parseFloat(showNumber.toFixed(fractionDigits))}%`;
            } else {
                return "0%"
            }
        } else {
            return `${this.value}`
        }
    }

    /**
     * 获取属性 with 加减符号
     * @param fractionDigits
     */
    getShowValueTextWithSymbol(fractionDigits: number = 2): string {
        const value = this.value;
        const symbolStr = value >= 0 ? "+" : "-";
        
        const valueText = this.getValueStringForUIShow(fractionDigits);
        return `${symbolStr}${valueText}`;
    }

    // icon 路径
    getIconPath(): string {
        const id = this.config.id;
        return G.TableManager.getDataById(table.battle.AttributeConfig, id)?.icon || "";
    }

    // 属性名称
    getAttrName(): string {
        const id = this.config.id;
        return G.TableManager.getDataById(table.battle.AttributeConfig, id)?.attrName || "";
    }
}