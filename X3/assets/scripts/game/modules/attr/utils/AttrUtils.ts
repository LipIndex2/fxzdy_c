import G from "db://assets/scripts/core/comm/G";
import { AttrConfigEffect } from "db://assets/scripts/game/modules/attr/structs/AttrConfigEffect";
import { Attribute } from "db://assets/scripts/game/modules/attr/AttrEnum";
import { AttrConfigManager } from "db://assets/scripts/game/modules/attr/config/AttrConfigManager";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";

export class AttrUtils {

    /**
     * 解析一个属性
     * @param kvArray
     */
    static parseKvArrayToOneAttr(
        kvArray: Array<{ k: any, v: any }>
    ): AttrConfigEffect | null {
        if (!kvArray || kvArray?.length == 0) {
            return null;
        }

        const kv = kvArray[0];
        if (!kv) {
            return null;
        }

        const attrId = kv.k;
        const configEffect = G.TableManager.getDataById(table.battle.AttributeConfig, attrId.toString());
        if (!configEffect) {
            return null;
        }
        return AttrConfigEffect.fromConfig(configEffect, kv.v);
    }

    /**
     * 解析属性列表 | 合并属性
     * @param kvArray
     */
    static parseKvArrayToAttrArray(
        kvArray: Readonly<Array<{ k: any, v: any }>>
    ): AttrConfigEffect[] {
        if (!kvArray) {
            return [];
        }

        const map = new Map<string, number>();
        for (let kv of kvArray) {
            if (!kv) {
                return null;
            }
            const attrId = kv.k;
            const v = kv.v as number;
            if (attrId == null) {
                return;
            }

            map.merge(attrId.toString(), v, (v1, v2) => v1 + v2);
        }
        return map.toDataStream()
            .map(it => {
                const attrId = it.key;
                const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrId);
                if (!config) {
                    return null;
                }
                const valueV = it.value;
                return AttrConfigEffect.fromConfig(config, valueV);
            })
            .filterNotNull()
            .toArray();
    }

    /**
     * 将 kvArray 转换为显示属性列表 | 区别在于没有值的属性也会显示 +0
     * @param kvArray
     * @param showAttributeTypeArray
     */
    static parseKvArrayToShowAttrArray(
        kvArray: Array<{ k: any, v: any }>,
        showAttributeTypeArray: Attribute[]
    ): AttrConfigEffect[] {
        const attrs = this.parseKvArrayToAttrArray(kvArray);
        const map = new Map<Attribute, number>();
        for (let attribute of showAttributeTypeArray) {
            map.set(attribute, 0)
        }
        for (let attr of attrs) {
            map.merge(attr.attrId, attr.value, (v1, v2) => v1 + v2);
        }
        return map.toDataStream()
            .map(it => {
                const key = it.key;
                const value = it.value;
                return AttrConfigEffect.create(key, value);
            })
            .toArray();
    }


    /**
     * 解析属性列表 | 不合并属性
     * @param kvArray
     */
    static parseKvArrayToAttrArrayWithNotMerge(
        kvArray: Array<{ k: any, v: any }>
    ): AttrConfigEffect[] {
        if (!kvArray) {
            return [];
        }

        const map = new Map<string, number>();
        for (let kv of kvArray) {
            if (!kv) {
                return null;
            }
            const attrId = kv.k;
            const v = kv.v as number;
            if (attrId == null) {
                return;
            }

            map.merge(attrId.toString(), v, (v1, v2) => v1 + v2);
        }
        return map.toDataStream()
            .map(it => {
                const attrId = it.key;
                const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrId);
                if (!config) {
                    return null;
                }
                const valueV = it.value;
                return AttrConfigEffect.fromConfig(config, valueV);
            })
            .filterNotNull()
            .toArray();
    }

    /**
     * 获取显示的属性值
     * @param attrData
     */
    static getShowAttrValue(attrData: AttrData) {
        if (!attrData) {
            return "+0";
        }
        const attrId = attrData.id;
        const attributeConfig = AttrConfigManager.getConfigById(attrId);
        if (!attributeConfig) {
            return "+0";
        }

        const value = attrData.num || 0;
        const effect = AttrConfigEffect.create(attrId, value)
        return effect.getShowValueTextWithSymbol(2);
    }
}