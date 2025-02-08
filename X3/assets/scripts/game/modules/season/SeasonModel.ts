import G from "../../../core/comm/G";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { IBattleResultWinData } from "../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../common/battle/structs/IBattleResultVo";
import { ConditionManager } from "../condition/ConditionManager";
import { FormationManager } from "../formation/FormationManager";
import { ActivityState, SeasonReachScoreType, TaskState } from "./EnumSeason";
import { SeasonBossBattleResultViewOpenArgs } from "./seasonBoss/interface/ISeasonBossArgs";
import { SeasonConfigManager } from "./SeasonConfigManager";
import { SeasonManager } from "./SeasonManager";
import { SecretSeasonManager } from "./seasonSecret/SecretSeasonManager";
import { SeasonBossVo } from "./vo/SeasonBossVo";
import { SeasonReachVo } from "./vo/SeasonReachVo";
import { SeasonSecretVo } from "./vo/SeasonSecretVo";
import { SignUpVo } from "./vo/SignUpVo";

/**
 * 赛季活动模块
 * @author GameCreator
 */
export class SeasonModel extends BaseModel {

	/**
	 * 模块标识
	 */
	private MODULE = 121;

	constructor() {
		super();
		this.regist();
	}

	listenNotifications(): string[] {
		return [NotificationKey.SYSTEM_NEW_DAY,
		NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE,
		NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION
		];
	}

	notificationHandler(name: string, args?: any): void {
		switch (name) {
			case NotificationKey.SYSTEM_NEW_DAY:
				this.sendGetCurrentSeasonActivities()
				break;
			case NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE:
				this.checkSendInfo();
				break;
			case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
				if (args == FightType.SEASON_BOSS) {
					//保存完阵容直接进入挑战
					let id = FormationManager.ins().getAutoFightParam(FightType.SEASON_BOSS)
					if (id) {
						SeasonModel.ins().sendChallengeSeasonBoss({ subActivityId: id, simulated: false })
						FormationManager.ins().deleteAutoFightParam(FightType.SEASON_BOSS)
					}
				}
				break;

		}
	}


	public static getModule(): number {
		return this.ins().MODULE;
	}

	/**
   * 注册所有从服务端收到的回调。
   */
	private regist(): void {
		// TODO 注册所有的指令
		let moduleId = this.MODULE;
		this.registerMsg(moduleId, 1, this.recGetSeasonActivity);
		this.registerMsg(moduleId, 2, this.recGetCurrentSeasonActivities);
		this.registerMsg(moduleId, 3, this.recDrawItemReward);
		this.registerMsg(moduleId, 4, this.recGetRankList);
		this.registerMsg(moduleId, 5, this.recChallengeSecret);
		this.registerMsg(moduleId, 6, this.recChallengeSeasonBoss);
		this.registerMsg(moduleId, 7, this.recHandleStuff);
		this.registerMsg(moduleId, -1, this.pushActivityStateChange);
		this.registerMsg(moduleId, -2, this.pushSubActivityStateChange);
		this.registerMsg(moduleId, -3, this.pushSeasonActivityReward);
		this.registerMsg(moduleId, -4, this.pushSecretBossSummon);
		this.registerMsg(moduleId, -5, this.pushSecretTransferFloor);
		this.registerMsg(moduleId, -6, this.pushSecretChallengeResult);
		this.registerMsg(moduleId, -7, this.pushSeasonBossChallengeResult);

	}

	public initData() {
		this.sendGetCurrentSeasonActivities();
	}

	/*********************************协议发送*********************************/

	/**
	 * 获取赛季活动
	 * 模块号：121	指令号：1
	 */
	public sendGetSeasonActivity(c2s: Vo.seasonactivity.GetSeasonActivityC2S): void {
		this.send(this.MODULE, 1, c2s);
	}

	/**
	 * 获取当前所有赛季活动列表
	 * 模块号：121	指令号：2
	 */
	public sendGetCurrentSeasonActivities(): void {
		this.send(this.MODULE, 2);
	}

	/**
	 * 领取赛季子活动奖励
	 * 模块号：121	指令号：3
	 */
	public sendDrawItemReward(c2s: Vo.seasonactivity.DrawItemRewardC2S): void {
		this.send(this.MODULE, 3, c2s, c2s);
	}

	/**
	 * 获取排行榜
	 * 模块号：121	指令号：4
	 */
	public sendGetRankList(c2s: Vo.seasonactivity.GetRankListC2S): void {
		this.send(this.MODULE, 4, c2s, c2s);
	}

	/**
	 * 挑战秘境
	 * 模块号：121	指令号：5
	 */
	public sendChallengeSecret(c2s: Vo.seasonactivity.ChallengeSecretC2S): void {
		const vo = SeasonManager.ins().getSubActityVo(c2s.subActivityId) as SeasonSecretVo;
		if (!vo || vo.state != ServerEnums.SubSeasonActivityState.START) {
			GIns.floatingTextMgr.showTips(`活动已经结算，无法进入战斗`);
			return;
		}
		const settleTime = vo.getSettleTime();
		if (settleTime < 0) {
			GIns.floatingTextMgr.showTips(`活动已经结算，无法进入战斗`);
			return;
		}
		const dur = +SeasonConfigManager.getConstValue('SEASON_ACTIVITY:SEASON_SECRET_SETTLE_CHALLENGE_TIME_LIMIT');
		if (settleTime < dur * 60000) {
			GIns.floatingTextMgr.showTips(`活动即将结算，无法进入战斗`);
			return;
		}

		this.send(this.MODULE, 5, c2s, c2s);
	}

	/**
	 * 挑战赛季Boss
	 * 模块号：121	指令号：6
	 */
	public sendChallengeSeasonBoss(c2s: Vo.seasonactivity.ChallengeSeasonBossC2S): void {

		const t = this;
		const vo = SeasonManager.ins().getSubActityVo(c2s.subActivityId) as SeasonBossVo;
		if (!vo || vo.state != ServerEnums.SubSeasonActivityState.START) {
			GIns.floatingTextMgr.showTips(`活动已经结算，无法进入战斗`);
			return;
		}
		const settleTime = vo.getSettleTime();
		if (settleTime < 0) {
			GIns.floatingTextMgr.showTips(`活动已经结算，无法进入战斗`);
			return;
		}
		const dur = +SeasonConfigManager.getConstValue('SEASON_ACTIVITY:SEASON_BOSS_SETTLE_CHALLENGE_TIME_LIMIT');
		if (settleTime < dur * 60000) {
			GIns.floatingTextMgr.showTips(`活动即将结算，无法进入战斗`);
			return;
		}


		this.send(this.MODULE, 6, c2s, c2s);
	}

	/**
	 * 处理活动事务
	 * 模块号：121	指令号：7
	 */
	public sendHandleStuff(c2s: Vo.seasonactivity.HandleStuffC2S): void {
		this.send(this.MODULE, 7, c2s, c2s);
	}

	/*********************************协议监听*********************************/

	/**
	 * 获取赛季活动
	 * 模块号：121	指令号：1
	 */
	public recGetSeasonActivity(data: Vo.seasonactivity.GetSeasonActivityS2C): void {
		if (data.code >= 0) {
		}
	}

	/**
	 * 获取当前所有赛季活动列表
	 * 模块号：121	指令号：2
	 */
	public recGetCurrentSeasonActivities(data: Vo.seasonactivity.GetCurrentSeasonActivitiesS2C): void {
		if (data.code >= 0) {
			const t = this;
			//TODO 在这里处理服务端返回的数据
			SeasonManager.ins().createSeasonVo(data.content);
			t.emit(NotificationKey.SEASON_ACTIVITY_NEWSTATE);
		}
	}

	/**
	 * 领取赛季子活动奖励
	 * 模块号：121	指令号：3
	 */
	public recDrawItemReward(data: Vo.seasonactivity.DrawItemRewardS2C, clientData: Vo.seasonactivity.DrawItemRewardC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			let vo = SeasonManager.ins().getSubActityVo(clientData.subActivityId) as any;
			if (vo) {
				//根据类型来处理数据啦
				const type = vo.type;
				if (type == ServerEnums.SubSeasonActivityType.SIGN_UP) {
					vo as SignUpVo
					const additional = data.content?.additional as [];
					if (!additional || additional.length < 0) {
						GIns.floatingTextMgr.showTips(`没到领取时间！`);
						return;
					}
					vo.addItems(additional);
					this.emit(NotificationKey.SEASON_SIGNUP_UPDATE)

					if (data.content?.rewardResults?.length > 0) {
						this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
					}

				}

				if (type == ServerEnums.SubSeasonActivityType.SEASON_REACH) {
					const reachVo = vo as SeasonReachVo;
					if (data.content?.rewardResults?.length > 0) {
						this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
					}
					const additional = data.content?.additional as [];
					if (additional?.length > 0) {
						reachVo.finishTaskIds(additional);
					}
					this.emit(NotificationKey.SEASON_TASK_UPDATE);
					reachVo.isShowRed();
				}

			}
		}
	}

	/**
	 * 获取排行榜
	 * 模块号：121	指令号：4
	 */
	public recGetRankList(data: Vo.seasonactivity.GetRankListS2C, clientData: Vo.seasonactivity.GetRankListC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.code >= 0) {
				let rankVo = data.content as Vo.ranking.RankingVo;
				console.log("排行榜返回", rankVo);
				G.FacadeManager.emit(NotificationKey.SEASON_RANK_UPDATE, { rankVo, clientData });
			}
		}
	}

	/**
	 * 挑战秘境
	 * 模块号：121	指令号：5
	 */
	public recChallengeSecret(data: Vo.seasonactivity.ChallengeSecretS2C, clientData: Vo.seasonactivity.ChallengeSecretC2S): void {
		if (data.code >= 0) {
			SecretSeasonManager.ins().challengeFloor = clientData.floor;
		}
	}

	/**
	 * 挑战赛季Boss
	 * 模块号：121	指令号：6
	 */
	public recChallengeSeasonBoss(data: Vo.seasonactivity.ChallengeSeasonBossS2C, clientData: Vo.seasonactivity.ChallengeSeasonBossC2S): void {
		if (data.code >= 0) {
			this.emit(NotificationKey.SEASON_BOSS_UPDATE)
		}
	}

	/**
	 * 处理活动事务
	 * 模块号：121	指令号：7
	 */
	public recHandleStuff(data: Vo.seasonactivity.HandleStuffS2C, clientData: Vo.seasonactivity.HandleStuffC2S): void {
		if (data.code >= 0) {
			const cfg = SeasonConfigManager.getSubConfigById(clientData?.subActivityId);
			if (cfg.type == ServerEnums.SubSeasonActivityType[ServerEnums.SubSeasonActivityType.SEASON_SECRET]) {
				GIns.floatingTextMgr.showTips(`购买成功!!`);
				const svo = SeasonManager.ins().getSubActityVo(cfg.id) as SeasonSecretVo;
				if (svo) {
					svo.dailyBuyChallengeTimes = svo.dailyBuyChallengeTimes + 1;
					svo.dailyChallengeTimes = svo.dailyChallengeTimes - 1;
				}
				this.emit(NotificationKey.SEASON_SECRET_TIMES_UPDATE);

				//TODO 在这里处理服务端返回的数据
				if (data.content) {
					this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content)
				}

			}

			if (cfg.type == ServerEnums.SubSeasonActivityType[ServerEnums.SubSeasonActivityType.SIGN_UP]) {
				GIns.floatingTextMgr.showTips(`报名成功!!`);
				const svo1 = SeasonManager.ins().getSubActityVo(cfg.id) as SignUpVo;
				if (svo1.activityVo) {
					svo1.activityVo.signed = true;
				}
				const content = data.content as Vo.activity.DrawRewardResultVo
				const additional = content?.additional as [];
				if (additional) {
					svo1.addItems(additional);
				}
				if (content?.rewardResults?.length > 0) {
					this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, content?.rewardResults);
				}

				this.emit(NotificationKey.SEASON_SIGNUP_UPDATE);
			}

		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送赛季活动状态变化，SeasonActivityNewStateVo
	 * 模块号：121	指令号：-1
	 */
	public pushActivityStateChange(vo: Vo.seasonactivity.SeasonActivityNewStateVo): void {
		if (vo?.activityId) {
			SeasonManager.ins().updateSeasonActivityState(vo);
			this.emit(NotificationKey.SEASON_ACTIVITY_NEWSTATE);
		}
	}



	/**
	 * 推送赛季子活动状态变化，SubSeasonActivityNewStateVo
	 * 模块号：121	指令号：-2
	 */
	public pushSubActivityStateChange(vo: Vo.seasonactivity.SubSeasonActivityNewStateVo): void {
		if (vo?.activityId) {
			SeasonManager.ins().updateSeasonSubActivityState(vo);
			if (vo.state == ActivityState.ING) {
				this.sendGetCurrentSeasonActivities();
			} else {
				this.emit(NotificationKey.SEASON_ACTIVITY_NEWSTATE);
			}
		}
	}

	/**
	 * 推送赛季活动奖励，SeasonActivityRewardVo
	 * 模块号：121	指令号：-3
	 */
	public pushSeasonActivityReward(vo: Vo.seasonactivity.SeasonActivityRewardVo): void {
		if (vo) {
			const rewardResults = vo.rewardResults;
			if (rewardResults) {
				this.emit(
					NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP,
					rewardResults
				);
			}
		}
	}

	/**
	 * 推送赛季秘境召唤Boss
	 * 模块号：121	指令号：-4
	 */
	public pushSecretBossSummon(): void {
		GIns.secretAreaMgr.bossAppear = true;
		this.emit(NotificationKey.SECRET_SEASON_AREA_UPDATE_BOSS);
		this.emit(NotificationKey.BATTLE_CLEAN_DEFENDER_UNITS);
	}

	/**
	 * 推送赛季秘境切换层数，currentFloor，当前层数
	 * 模块号：121	指令号：-5
	 */
	public pushSecretTransferFloor(currentFloor: number): void {
		let modulePlayInfo = GIns.battleMgr.mainScene.battleData.modulePlayInfo as Vo.seasonactivity.SeasonSecretBattleInfo;
		modulePlayInfo.currentFloor = currentFloor;

		this.emit(NotificationKey.SECRET_AREA_TRANSFER);
	}

	/**
	 * 推送赛季秘境挑战结果信息，SeasonSecretChallengeResultVo
	 * 模块号：121	指令号：-6
	 */
	public pushSecretChallengeResult(vo: Vo.seasonactivity.SeasonSecretChallengeResultVo): void {
		if (vo) {
			//更新玩法数据
			const svo = SeasonManager.ins().getSubActityVo(vo.subActivityId) as SeasonSecretVo;
			if (svo) {
				/**这里更新数据 */
				if (vo.win) {
					const id = vo.secretConfigId;
					const cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, id);
					if (cfg && (cfg.floor > svo.level || !svo.level)) {
						svo.level = cfg.floor;
					}
				}
				svo.dailyChallengeTimes = vo.dailyChallengeTimes == undefined ?
					svo.dailyChallengeTimes : vo.dailyChallengeTimes;
				svo.dailyChallengeRewardTimes = vo.dailyChallengeRewardTimes == undefined ?
					svo.dailyChallengeRewardTimes : vo.dailyChallengeRewardTimes;

				//结束秘境
				this.emit(NotificationKey.SECRET_AREA_BATTLE_WIN);
				let resultVo: IBattleResultVo = { isWin: true, fightType: FightType.SEASON_SECRET };
				this.emit(NotificationKey.BATTLE_RESULT, resultVo);
				this.emit(NotificationKey.BATTLE_RESULT_WIN, {
					fightType: FightType.SEASON_SECRET, exData: vo, isWin: true
				} as IBattleResultWinData)
			}


			const first = vo.firstRewardResults || [];
			const normal = vo.challengeRewardResults || [];
			const rewardResults = first.concat(normal);
			if (rewardResults) {
				this.emit(
					NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP,
					rewardResults
				);
			}
		}
	}

	/**
	 * 推送赛季Boss挑战结果信息，SeasonBossChallengeResultVo
	 * 模块号：121	指令号：-7
	 */
	public pushSeasonBossChallengeResult(vo: Vo.seasonactivity.SeasonBossChallengeResultVo): void {
		if (vo) {
			//更新玩法数据
			const svo = SeasonManager.ins().getSubActityVo(vo.subActivityId) as SeasonBossVo;
			if (svo) {
				this.emit(NotificationKey.SEASON_ACTIVITY_NEWSTATE);
			}

			const winFlag = vo.win;
			const oldH = svo.hurt;
			const isNewH = vo.hurt > oldH;

			let isNewR = false;
			if (svo.maxRank > 0) {
				if (vo.rank > 0) {
					isNewR = vo.rank < svo.maxRank;
				}
			} else if (vo.rank > 0) {
				isNewR = true;
			}

			let progressRewardId = SeasonConfigManager.getRewardId(vo.progressRewardId)

			this.emit(NotificationKey.BATTLE_RESULT_WIN, {
				fightType: FightType.SEASON_BOSS,
				exData: SeasonBossBattleResultViewOpenArgs.create(
					winFlag,
					vo.rank,
					vo.hurt,
					svo.progressRewardId,
					progressRewardId,
					isNewH,
					isNewR,
					vo.subActivityId,
					vo.bossConfigId,
					vo.simulated,
				),
				isWin: vo.win,
			} as IBattleResultWinData)
			vo.progressRewardId = progressRewardId;
			if (!vo.simulated) {
				svo.updateActivityVo(vo);
			}

			const rewardResults = vo.rewardResults;
			if (rewardResults) {
				this.emit(
					NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP,
					rewardResults
				);
			}

		}
	}

	sendGetRewards(cfg: table.seasonactivity.Task.SeasonActivityTaskConfig) {
		const vo = SeasonManager.ins().getSubActityVo(cfg.subActivityId) as SeasonReachVo;
		if (vo) {
			const type = cfg.taskType;
			const cfgs = vo.getTaskCfgs(SeasonReachScoreType[type]);
			let string;
			cfgs.forEach(cfg => {
				const state = vo.getTaskState(cfg.id);
				if (state == TaskState.CAN_GET) {
					if (!string) {
						string = cfg.id + '';
					} else {
						string += ',' + cfg.id;
					}
				}
			})
			if (string && string.length > 0) {
				SeasonModel.ins().sendDrawItemReward({ subActivityId: cfg.subActivityId, itemId: string })
			}
		}
	}

	checkSendInfo() {
		const id = SeasonManager.ins().curSeasonActId;
		if (id) {
			const cfg = TableManager.getDataById(table.seasonactivity.Constant.SeasonActivityConfig, id);
			if (cfg?.openConditions) {
				if (ConditionManager.ins().checkCondition(cfg?.openConditions)) {
					;
					const signVo = SeasonManager.ins().getSubActityVo(SeasonManager.ins().getSignUpActId()) as SignUpVo;
					if (!signVo || !signVo.activityVo) {
						this.sendGetCurrentSeasonActivities();
					}
					return;
				}
			}
		}
	}

}
