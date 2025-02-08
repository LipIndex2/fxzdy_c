

/**战斗单位数据结构 */
export interface IBattleUnitData {
     /**uid 单位ID,本场战斗唯一ID 后端生成 */
     uid?: number;
     /**
      * 配置ID
      */
     configId: number;
     /**
      * 单位类型,UnitType @see ServerEnums.UnitType
      */
     type: number;
     /**
      * 等级
      */
     level: number;

     /**
      * 等阶
      */
     stage: number;

     /**
      * 星级
      */
     star: number;

     /**
      * 战斗属性,AttributeType-属性值
      */
     attrs: { [attrType: number]: number };

     /**
      * 技能ID列表
      */
     skillIds?: Array<string>;

     /**
      * 模型id
      */
     modelId?: number;

     /**
      * 皮肤id
      */
     skinId?: number;

     /**
      * 资源点ID
      */
     resourceId?: number;

     /**资源点下标*/
     resourceIdx?: number;

     /**
           * 怪物资源ID对应MonsterResourceConfig.id,0表示非怪物
           */
     monsterResourceId: number;

     /**
          * 阵位
          */
     position: number;
     /**
          * 单位剩余血量,覆盖战斗属性血量值,<=0则不生效
          */
     surplusHp?: number;

     /****掉落奖励,道具id和数量 */
     dropReward?: { itemId: number, num: number }[]
}