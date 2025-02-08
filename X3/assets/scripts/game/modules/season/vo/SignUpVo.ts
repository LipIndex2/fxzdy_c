import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { TimeManager } from "../../../../core/time/TimeManager";
import { ActivityState } from "../EnumSeason";
import { SeasonBaseVo } from "./SeasonBaseVo";

/**
 * 签到
 */
export class SignUpVo extends SeasonBaseVo {

    // /**是否已报*/		
	// signed:boolean;
	// /**已领取奖励Id列表 */	
	// rewardIds:Array<number> = [];

    /**活动对应的vo数据  */
    public get activityVo(): Vo.seasonactivity.SignUpVo {
        return this.content as Vo.seasonactivity.SignUpVo;
    }

    public addItems(ids:number[]){
        if(!this.activityVo?.rewardIds){
            return 
        }
        ids.forEach(v=>{
            if(this.activityVo.rewardIds.indexOf(v) == -1){
                this.activityVo.rewardIds.push(v);
                this.activityVo.signed = true;
            }
        })
    }

    /** 奖励是否已领取 */
    public isRewardGet(id: number): boolean {
        let isGet = false;
        if(!this.activityVo?.rewardIds){
            if(this.state == ActivityState.LOCK){
                return false;
            } else if(this.state == ActivityState.CLOSE){
                return true;
            }
        }else{
            for (let rewardId of this.activityVo.rewardIds) {
                if (rewardId == id) {
                    isGet = true;
                }
            }
        }

        return isGet;
    }

    /**获取距离领奖时间 */
    public getDur(id:number){
        const t = this;
        const cfg = TableManager.getDataById(table.seasonactivity.SignUp.SignUpConfig, id);
        const day = cfg.openDay;
        return (day-1)*24*3600*1000 - (G.TimeManager.serverNow - t.startTime);
    }

    /**天数 */
    public getPro(id:number, PassTypeDay:number = 0): number {
        const cfg = TableManager.getDataById(table.seasonactivity.SignUp.SignUpConfig, id);
        const day = cfg.openDay;
        if(PassTypeDay - this.getPassDays() > 0){
            return 0
        }
        return Math.floor((this.getPassDays() - PassTypeDay) / (day - PassTypeDay) *100);
    }

    public get signed(){
        return this.activityVo?.signed;
    }
}