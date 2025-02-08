
/**收藏品技能 */
export interface IBattleCollectionData {
    /**uid 单位ID,本场战斗唯一ID 后端生成 */
    uid?: number;
    /**
     * 技能ID列表
     */
    skillIds?: Array<string>;
}