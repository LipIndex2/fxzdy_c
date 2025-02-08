import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 一整个系统, 提供的特殊战斗力。
 * 例如：天赋。 技能效果会单独有战斗力.
 */
export interface IFightFromModuleApi {

    /**
     * 获取整个模块提供的全局战斗力 | 非属性部分提供的
     * @param fightType 战斗类型 | 部分模块不关心的自己处理
     */
    getAddPowerNum(fightType: ServerEnums.FightType): number;

    /**
     * 战斗力修正系数
     * @param fightType
     */
    getAddPowerModNum(fightType: ServerEnums.FightType): number;

}

export interface IFightFromModuleData {
    Mod: number;
    Fight: number;
}