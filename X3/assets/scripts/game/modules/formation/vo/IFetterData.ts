import { HeroCampType, HeroCareerType } from "../../hero/HeroEnum";

/** 羁绊data */
export interface IFetterData {
    /** 类型 */
    type: ServerEnums.Career | HeroCampType;
    /** 人数 */
    num: number;
}