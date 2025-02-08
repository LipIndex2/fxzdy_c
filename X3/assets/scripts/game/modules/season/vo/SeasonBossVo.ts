import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TableManager } from "../../../../core/table/TableManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { FormationManager } from "../../formation/FormationManager";
import { FormationVo } from "../../formation/vo/FormationVo";
import { PositionVoData } from "../../formation/vo/PositionVo";
import { ActivityState, PassType, TaskState } from "../EnumSeason";
import { SeasonConfigManager } from "../SeasonConfigManager";
import {  SeasonBaseVo } from "./SeasonBaseVo";

/**
 * 积分冲榜
 */
export class SeasonBossVo extends SeasonBaseVo {

    public formation:FormationVo;
    public progressRewardId:number = -1;

    /**活动对应的vo数据  */
    public get activityVo(): Vo.seasonactivity.SeasonBossVo {
        return this.content as Vo.seasonactivity.SeasonBossVo;
    }


    onInitDone(){
        const content = this?.activityVo;
        if(content){
			//TODO 在这里处理服务端返回的数据
			if (content.customFormationVos &&  content.customFormationVos[0]) {
				let vo = content.customFormationVos[0];
				let formationVo = new FormationVo(FightType.SEASON_BOSS, vo.index, vo.subParam);
				let allPosData = formationVo.allPosData;
				for (let newPosData of allPosData) {
					let formation = FormationManager.ins().getDefaultFormationVo().clone();
					let oldPosData = formation.allPosData[newPosData.BaseId - 1];
					if (oldPosData.soltVo) {
						newPosData.setSoltVoData(oldPosData.soltVo);
					}
					let oldPosData2 = vo.formationVo.positionVoMap[newPosData.BaseId];
					if (oldPosData2) {
						newPosData.setPosVoData(oldPosData2 as PositionVoData);
					}
				}
				this.formation = formationVo;
			}
            this.initProgressId();
        }
        this.isShowRed();
        FacadeManager.ins().emit(NotificationKey.SEASON_BOSS_UPDATE);
    }

    public updateActivityVo(data:Vo.seasonactivity.SeasonBossChallengeResultVo){
        const t = this;
        if(data.rank && data.rank > 0){
            if(t.maxRank <= 0){
                t.maxRank = data.rank;
            }
            if(t.maxRank > data.rank){
                t.maxRank = data.rank;
            }
        }
        if(data.hurt && data.hurt > t.hurt){
            t.hurt = data.hurt;
        }
        t.maxRank = data.rank == undefined?t.maxRank:data.rank;
        t.hurt = data.hurt == undefined?t.hurt:data.hurt;
        t.dailyChallengeTimes = data.dailyChallengeTimes == undefined?t.dailyChallengeTimes:data.dailyChallengeTimes;
        t.progressRewardId = data.progressRewardId == undefined?t.progressRewardId:data.progressRewardId;
        //更新界面
        FacadeManager.ins().emit(NotificationKey.SEASON_BOSS_UPDATE);
				 
    }

    private initProgressId(){
        const t = this;
        const rewardIds = this.activityVo?.rewardIds
        if(rewardIds?.length > 0){
            t.progressRewardId = rewardIds.toDataStream().maxByWeightNumber(it => it, 0);
        }
    }


    public get maxRank(){
        return this.activityVo?.maxRank || 0;
    }

    public set maxRank(rank:number){
        if(this.activityVo){
            this.activityVo.maxRank = rank;
        }
    }

    public get hurt(){
        return this.activityVo?.hurt || 0;
    }
 
    public set hurt(hurt:number){
        if(this.activityVo){
            this.activityVo.hurt = hurt;
        }
    }

    public get dailyChallengeTimes(){
        return this.activityVo?.dailyChallengeTimes || 0;
    }

    public set dailyChallengeTimes(dailyChallengeTimes:number){
        if(this.activityVo){
            this.activityVo.dailyChallengeTimes = dailyChallengeTimes;
        }
        this.isShowRed();
    }

    public get displayValue(){
        return this.activityVo?.displayValue || 0;
    }

    public set displayValue(displayValue:number){
        if(this.activityVo){
            this.activityVo.displayValue = displayValue;
        }
    }

    public get nextDailyResetTime(){
        return this.activityVo?.nextDailyResetTime || 0;
    }

    public set nextDailyResetTime(nextDailyResetTime:number){
        if(this.activityVo){
            this.activityVo.nextDailyResetTime = nextDailyResetTime;
        }
    }

    _bossCfg:table.seasonactivity.SeasonBoss.SeasonBossConfig;
    public get bossCfg():table.seasonactivity.SeasonBoss.SeasonBossConfig{
        if(this._bossCfg){
            return this._bossCfg;
        }
        const id = this.activityId;
        const allCfg = TableManager.getAllData(table.seasonactivity.SeasonBoss.SeasonBossConfig);
        for(const cfg of allCfg){
            if(cfg.subActivityId == id){
                this._bossCfg = cfg;
                break;
            }
        }
        return this._bossCfg;
    }

    /**获取挑战总次数 */
    public get dailyChallengeTotalTimes(){
        return this.bossCfg?.dailyChallengeTimes || 0;
    }

    /**获取挑战总次数 */
    public get battleConfigId(){
        return this.bossCfg?.battleConfigId;
    }


    /**获取挑战总次数 */
    public get spineModelId(){
        return this.bossCfg?.spineModelId;
    }
    
    /**获取剩余 挑战次数 */
    public getChallengeLeft(){
        const totalTimes = this.bossCfg?.dailyChallengeTimes || 0;
        return totalTimes - this.dailyChallengeTimes;
    }

    

    /**当前展示的伤害奖励档次 */
    public getRewardInfo():{sid:number, state:TaskState, hp:number}{
        const hurt = this.hurt;
        const rewardCfgs = SeasonConfigManager.getBossRewards();
        for(let i = 0; i <= rewardCfgs.length - 1; i++){
            const reward = rewardCfgs[i];
            if(reward.hp > hurt){
                return {sid:reward.id, state:TaskState.ING, hp:reward.hp};
            }
        }
        const lastR = rewardCfgs[rewardCfgs.length - 1];
        return {sid:lastR.id, state:TaskState.FINISH, hp:lastR.hp};
    }

    /**刷新红点 */
    isShowRed(){
        const selTime = this.getSettleTime();
        if(this.state == ActivityState.ING && selTime > 0){
            GIns.redDotMgr.setRedDot(RedDotKeys.Season_sub_entrance, this.dailyChallengeTimes == 0, [this.activityId]);
            return true;
        }
        GIns.redDotMgr.setRedDot(RedDotKeys.Season_sub_entrance, false, [this.activityId]);
        return false;
    }
}