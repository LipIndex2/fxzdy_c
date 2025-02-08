import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../core/table/TableManager";
import { BattleLogicManager } from "../../comm/battle/BattleLogicManager";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { IBattleResultWinData } from "../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../common/battle/structs/IBattleResultVo";
import { FormationManager } from "../formation/FormationManager";
import { FormationVo } from "../formation/vo/FormationVo";
import { PositionVoData } from "../formation/vo/PositionVo";
import { EventRankDataResp } from "../rank/event/EventRankData";
import { SecretAreaManager } from "./SecretAreaManager";

/**
 * 秘境副本模块
 * @author GameCreator
 */
export class SecretAreaModule extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 34;

	constructor() {
		super();
		this.regist();
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
		this.registerMsg(moduleId, 1, this.recLoadSecretInstanceInfo);
		this.registerMsg(moduleId, 2, this.recChallenge);
		this.registerMsg(moduleId, 3, this.recLoadRankList);
		this.registerMsg(moduleId, 4, this.recSweep);
		this.registerMsg(moduleId, -1, this.pushChallengeResult);
		this.registerMsg(moduleId, -2, this.pushBossSummon);
		this.registerMsg(moduleId, -3, this.pushTransferFloor);
	}
	/*********************************协议发送*********************************/

	/**
	 * 获取秘境副本信息
	 * 模块号：34	指令号：1
	 */
	public sendLoadSecretInstanceInfo(): void {
		this.send(this.MODULE, 1);
	}

	/**
	 * 挑战秘境副本
	 * 模块号：34	指令号：2
	 */
	public sendChallenge(floor: number): void {
		let c2s = {} as Vo.secretinstance.ChallengeC2S;
		c2s.floor = floor;
		this.send(this.MODULE, 2, c2s, c2s);
	}

	/**
	 * 获取排行榜列表
	 * 模块号：34	指令号：3
	 */
	public sendLoadRankList(page: number): void {
		let c2s = {} as Vo.secretinstance.LoadRankListC2S;
		c2s.page = page;
		this.send(this.MODULE, 3, c2s);
	}

	/**
	 * 秘境副本扫荡
	 * 模块号：34	指令号：4
	 */
	public sendSweep(floor: number, count: number, advert: boolean = false) {
		let c2s: Vo.secretinstance.SweepC2S = {
			floor: floor,
			count: count,
			advert: advert
		};

		this.send(this.MODULE, 4, c2s);

	}

	/*********************************协议监听*********************************/

	/**
	 * 获取秘境副本信息
	 * 模块号：34	指令号：1
	 */
	public recLoadSecretInstanceInfo(data: Vo.secretinstance.LoadSecretInstanceInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content.customFormationVos && data.content.customFormationVos[0]) {
				let vo = data.content.customFormationVos[0];
				let formationVo = new FormationVo(FightType.SECRET_INSTANCE, vo.index, vo.subParam);
				formationVo.collectionsId = vo.formationVo.collectiblesId;
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
				SecretAreaManager.ins().formation = formationVo;
			}

			SecretAreaManager.ins().setFloorBattleSecondsMap(data.content.floorBattleSecondsMap);
			SecretAreaManager.ins().level = data.content.passFloor;
			SecretAreaManager.ins().endTime = data.content.serverSettleTime;
			SecretAreaManager.ins().todaySweepAdvertTimes = data.content.todaySweepAdvertTimes;
			this.emit(NotificationKey.SECRET_AREA_UPDATE_INFO);
		}
	}

	/**
	 * 挑战秘境副本
	 * 模块号：34	指令号：2
	 */
	public recChallenge(data: Vo.secretinstance.ChallengeS2C, c2s: Vo.secretinstance.ChallengeC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			SecretAreaManager.ins().isEnter = true;
			SecretAreaManager.ins().challengeFloor = c2s.floor;
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content);
		}
	}

	/**
	 * 获取排行榜列表
	 * 模块号：34	指令号：3
	 */
	public recLoadRankList(data: Vo.secretinstance.LoadRankListS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			if (data.content.rank >= 0) {
				SecretAreaManager.ins().rank = data.content.rank;
			}
			this.emit(NotificationKey.RANK_ON_DATA_RESP, EventRankDataResp.createBySecretInstance(data.content));
		}
	}

	/**
	 * 秘境副本扫荡
	 * 模块号：34	指令号：4
	 */
	public recSweep(data: Vo.secretinstance.SweepS2C) {
		if (data.code >= 0) {
			let content = data.content;
			SecretAreaManager.ins().todaySweepAdvertTimes = data.content.todaySweepAdvertTimes;
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, content.rewardResults);
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, content.costItemResults);
			this.emit(NotificationKey.SECRET_AREA_SWEEP);
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送挑战结果,SecretInstanceChallengeVo
	 * 模块号：34	指令号：-1
	 */
	public pushChallengeResult(vo: Vo.secretinstance.SecretInstanceChallengeVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		console.log("秘境战斗结束！！！")
		let SAMgr = SecretAreaManager.ins();
		if (vo.win && vo.passFloor > SAMgr.level && GIns.secretAreaMgr.isCanSel(vo.passFloor, 1)) {
			let isLock = GIns.secretAreaMgr.getFloorIsLock(vo.passFloor + 1);
			if (isLock == false) {
				SAMgr.showUnlockAni = true;
			}
		}

		if (!SAMgr.isEnter) return;

		if (vo.win) {
			//胜利
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, vo.rewardResults);

			if (SAMgr.bossId) {
				let dropItems: { itemId: any, num: number }[] = [];
				for (let data of vo.rewardResults) {
					if (data) {
						dropItems.push({
							itemId: data.baseId,
							num: data.amount
						});
					}
				}

				let cfg = TableManager.getDataById(table.battle.MonsterResourceConfig, SAMgr.bossId);
				BattleLogicManager.ins().get(FightType.SECRET_INSTANCE).dropManager.showDelayDropMonster(cfg.monsterId, dropItems)
				SAMgr.bossId = null
			}

			let checkNewUnLock = vo.passFloor > SAMgr.level;
			SAMgr.level = vo.passFloor;
			SAMgr.rank = vo.rank;

			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, vo.costItemResults);
			this.emit(NotificationKey.SECRET_AREA_BATTLE_WIN);
			let resultVo: IBattleResultVo = { isWin: true, fightType: FightType.SECRET_INSTANCE };
			this.emit(NotificationKey.BATTLE_RESULT, resultVo);
			this.emit(NotificationKey.BATTLE_RESULT_WIN, {
				fightType: FightType.SECRET_INSTANCE, exData: vo, isWin: true
			} as IBattleResultWinData)

			if (checkNewUnLock) {
				GIns.secretAreaMgr.checkShowUnlockAni({ newFloor: true });
			}
		} else {
			//失败
			this.emit(NotificationKey.BATTLE_RESULT_WIN, {
				fightType: FightType.SECRET_INSTANCE, exData: vo
			} as IBattleResultWinData)
		}
	}

	/**
	 * 推送BOSS召唤
	 * 模块号：34	指令号：-2
	 */
	public pushBossSummon(): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		GIns.secretAreaMgr.bossAppear = true;
		this.emit(NotificationKey.SECRET_AREA_UPDATE_BOSS);
		this.emit(NotificationKey.BATTLE_CLEAN_DEFENDER_UNITS);
	}

	/**
	 * 推送传送层数,当前所在层数
	 * 模块号：34	指令号：-3
	 */
	public pushTransferFloor(currentFloor: number): void {
		let modulePlayInfo = GIns.battleMgr.mainScene.battleData.modulePlayInfo as Vo.secretinstance.SecretInstanceBattleInfo;
		modulePlayInfo.currentFloor = currentFloor;

		this.emit(NotificationKey.SECRET_AREA_TRANSFER);
	}
}
