/**
 * 经营设备等级配置
*/
export interface IStimulationLvCfg {
    /**配置map*/
    cfMap:Map<string, table.stimulation.StimulationDeviceLevelConfig>;
    /**位置解锁等级*/
    posUnlockLvMap:Map<number, number>;
    /**位置数量*/
    maxPosCnt:number;
}