import {  SeasonBaseVo } from "./SeasonBaseVo";

/**
 * 积分冲榜
 */
export class EmptyContentVo extends SeasonBaseVo {

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.EmptyContentVo {
        return this.content as Vo.activity.EmptyContentVo;
    }
}
