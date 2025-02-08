import { ServerEnums } from "../../../../libs/extras/ServerEnums";

/**队伍技能 */
export interface IBattleTeamData {
    /**uid 单位ID,本场战斗唯一ID 后端生成 */
    uid?: number;
    /**
     * 技能ID列表
     */
    skillIds?: Array<string>;
    /***实体类型 */
    type: ServerEnums.UnitType
}