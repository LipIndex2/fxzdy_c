/**设备加成数据*/
export interface IStimulationAddition {
    /**1小时的产量 来自配置数据 主要用来展示 实际计算以毫秒产量为准*/
    itemAmountPerHour: number;
    /**产出1个需要多少毫秒 向下取整的 用来实际计算产出的数据*/
    intervalMillis: number;
    /**储量上限*/
    capacity: number
}