import { IStimulationCfg } from "./IStimulationCfg";

export interface IStimulationPosData {
    /**位置id*/
    id: number;
    /**是否解锁*/
    isUnlock: boolean;
    /**解锁需要等级*/
    needLv: number;
}

/**
 * 经营设备数据
*/
export interface IStimulationData {
    cfg: IStimulationCfg;
    /**vo为空代表未激活*/
    vo: Vo.stimulation.StimulationDeviceVo;
    /**位置信息*/
    posMap: Map<number, IStimulationPosData>;
    /**下次刷新倒计时key*/
    timerKey: string;
}