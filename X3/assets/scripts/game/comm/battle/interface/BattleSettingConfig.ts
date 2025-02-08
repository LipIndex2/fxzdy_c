/**
 * 战斗设置配置数据
 * table.battle.BattleSettingConfig 为前后端都是用的战斗类型
 * table.battle.BattleSettingClientConfig 为前端扩展的战斗类型 结构和BattleSettingConfig相同
*/
export type BattleSettingConfig = table.battle.BattleSettingConfig | table.battle.BattleSettingClientConfig;