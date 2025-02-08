import { IBattleUnitData } from "./IBattleUnitData";

/**战斗单位创建模式 */
export interface IBattleUnitCreateMode {
     /**创建间隔*/
     interval: number;
     /**每次最大创建数量*/
     preCnt: number;
     /**最大创建时间 (优先级比maxCnt高 如果发现时间不够或者maxCnt未配置 会主动修改maxCnt属性)*/
     maxTime?:number;
     /**最多存活怪物数量 (需要自己处理 公共出怪部分没有处理这个字段)*/
     maxAliveCnt?:number
}

/**战斗单位创建数据结构 */
export interface IBattleUnitCreateData {
     /**战斗配置id*/
     battleConfigId:number
     /**创建模式*/
     mode: IBattleUnitCreateMode;
     /**上次创建时间*/
     lastCreateTime:number;
     /**单位列表数据*/
     units: IBattleUnitData[];
}