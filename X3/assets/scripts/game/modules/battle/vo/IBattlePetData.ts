
/**宠物 */
export interface IBattlePetData {
    uid?: number;
    /***配置ID */
    configId: number
    /**
     * 技能ID列表
     */
    skillIds?: Array<string>;

    /**
     * 战斗属性,AttributeType-属性值
     */
    attrs?: { [attrType: number]: number };
}