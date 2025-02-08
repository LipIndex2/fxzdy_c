import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { FormationManager } from "../../formation/FormationManager";
import { FormationVo } from "../../formation/vo/FormationVo";
import { PositionVoData } from "../../formation/vo/PositionVo";
import { PlayerModel } from "../../player/model/PlayerModel";
import { ActivityState, PassType } from "../EnumSeason";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager } from "../SeasonManager";
import { SecretSeasonController } from "../seasonSecret/SecretSeasonController";
import { SecretSeasonManager } from "../seasonSecret/SecretSeasonManager";
import { SeasonBaseVo } from "./SeasonBaseVo";

/**
 * 竞速秘境
 */
export class SeasonSecretVo extends SeasonBaseVo {

 

    /**活动对应的vo数据  */
    public get activityVo(): Vo.seasonactivity.SeasonSecretVo {
        return this.content as Vo.seasonactivity.SeasonSecretVo;
    }

    onInitDone(){
        const content = this?.activityVo;
        if(content){
			//TODO 在这里处理服务端返回的数据
			if (content.customFormationVos &&  content.customFormationVos[0]) {
				let vo = content.customFormationVos[0];
				let formationVo = new FormationVo(FightType.SECRET_INSTANCE, vo.index, vo.subParam);
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
				SecretSeasonManager.ins().formation = formationVo;
			}

			SecretSeasonManager.ins().setFloorBattleSecondsMap(content.floor2MinSeconds);
			SecretSeasonManager.ins().level = content.passFloor == undefined?
			SecretSeasonManager.ins().level:content.passFloor;
			SecretSeasonManager.ins().endTime = this.endTime;
            SecretSeasonManager.ins().dailyBuyChallengeTimes = content.dailyBuyChallengeTimes == undefined? 
            SecretSeasonManager.ins().dailyBuyChallengeTimes:content.dailyBuyChallengeTimes;
			SecretSeasonManager.ins().rank = content.maxRank == undefined?
			SecretSeasonManager.ins().rank:content.maxRank;
			

            SecretSeasonManager.ins().dailyChallengeTimes = content.dailyChallengeTimes == undefined? 
            SecretSeasonManager.ins().dailyChallengeTimes:content.dailyChallengeTimes;

			SecretSeasonController.ins().actId = this.activityId;
        }
		this.isShowRed();
		FacadeManager.ins().emit(NotificationKey.SEASON_SECRET_UPDATE);
    }

	/**已通关层数 */
	set level(l:number){
		const content = this?.activityVo;
		if(content){
			content.passFloor = l;
		}
		SecretSeasonManager.ins().level = l;
	}

	get level(){
		return SecretSeasonManager.ins()?.level || 0;
	}


	/**今日已挑战次数 */
	set dailyChallengeTimes(l:number){
		const content = this?.activityVo;
		if(content){
			content.dailyChallengeTimes = l;
		}
		SecretSeasonManager.ins().dailyChallengeTimes = l;
	}

	get dailyChallengeTimes(){
		return SecretSeasonManager.ins().dailyChallengeTimes;
	}

	/**今日已领取奖励次数 */
	set dailyChallengeRewardTimes(l:number){
		const content = this?.activityVo;
		if(content){
			content.dailyChallengeRewardTimes = l;
		}
		this.isShowRed();
	}
	
	get dailyChallengeRewardTimes(){
		return this?.activityVo?.dailyChallengeRewardTimes || 0
	}

	

	/**获取当前剩余次数 */
	get challengeTimesLeft(){
		const limit = this.Mgr.dailyChallengeTimesLimit;
		const times = limit - this.dailyChallengeTimes;
		return times;
	}

	/**获取剩余奖励次数 */
	get leftRewardTimes(){
		const limit = this.Mgr.dailyChallengeRewardsLimit;
		return limit - this.dailyChallengeRewardTimes;
	}
	
    /**今日已购买挑战次数 */
	set dailyBuyChallengeTimes(l:number){
		const content = this?.activityVo;
		if(content){
			content.dailyBuyChallengeTimes = l;
		}
		SecretSeasonManager.ins().dailyBuyChallengeTimes = l;
	}

	get dailyBuyChallengeTimes(){
		return SecretSeasonManager.ins().dailyBuyChallengeTimes;
	}

	set maxRank(l:number){
		const content = this?.activityVo;
		if(content){
			content.maxRank = l;
		}
		SecretSeasonManager.ins().rank = l;
	}

    updateInfo(){

    }

    public getSecretState(id:number):PassType{
        const passFloor = this.Mgr.level || 0;
        const cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, id);
 
        if (!cfg ||  (cfg.floor > this.Mgr.level + 1 && cfg.floor != 1) ) {
            //未通关上一关卡
            return PassType.Lock;
        }

        if(cfg.floor <= passFloor){
            return PassType.Pass
        }
        if(FormationManager.ins().getCommonLevel() < cfg.level){
            return PassType.Lock;
        }
        return PassType.Ing;
    }

    public get Mgr(){
        return SecretSeasonManager.ins();
    }

    public get Ctor(){
        return SecretSeasonController.ins();
    }

       /**刷新红点 */
	isShowRed(){
		const selTime = this.getSettleTime();
        if(this.state == ActivityState.ING && selTime > 0){
			const state = this.leftRewardTimes > 0; 
            GIns.redDotMgr.setRedDot(RedDotKeys.Season_sub_entrance, state, [this.activityId]);
            return true;
        }
        GIns.redDotMgr.setRedDot(RedDotKeys.Season_sub_entrance, false, [this.activityId]);
		return false;
    }

	/**获取赛季秘境关卡展示列表（不开启的关卡只展示一关） */
	getSecretLists():table.seasonactivity.SeasonSecret.SeasonSecretConfig[]{
		const aid = this.activityId
		const totalList = SeasonConfigManager.getSecretCfgs(aid);
		const slist = [];
		for(let i=0; i<totalList.length; i++){
			const cfg:table.seasonactivity.SeasonSecret.SeasonSecretConfig = totalList[i];
			const state = this.getSecretState(cfg.id);
			slist.push(cfg)
			const len = slist.length;
			if(state == PassType.Lock && len >= 3 && len < totalList.length){
				slist.push({id:-1});
				break;
			}
		}
		return slist
	}
}