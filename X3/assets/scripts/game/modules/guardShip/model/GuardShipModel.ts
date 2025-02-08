import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BattleConfigManager } from "../../../comm/battle/config/BattleConfigManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { EventRankDataResp } from "../../rank/event/EventRankData";
import { GuardShipBattleBuffVo } from "./vo/GuardShipBattleBuffVo";
import { GuardShipBattleVo } from "./vo/GuardShipBattleVo";

/**
 * 守卫母舰模块
 * @author GameCreator
 */
export class GuardShipModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 46;

	protected _freeTimes: number = 3
	protected _freeIcon: string = ''

	protected _passInstanceIds: number[] = []

	/**已通关层级*/
	protected _curFloor: number = 0
	protected _minFloor: number = 0;
	protected _maxFloor: number = 0;
	protected _curChallFloor: number = 0;
	/**结算时间*/
	protected _endTime: number = 0
	/**挑战消耗*/
	protected _challengeCosts: NoOwnerItem[] = null

	/**我的排名 请求排行榜列表时才刷新*/
	public myRank: number = 0

	/**战斗数据*/
	public battleVo: GuardShipBattleVo = new GuardShipBattleVo()
	/**战斗buff*/
	public battleBuffVo: GuardShipBattleBuffVo = new GuardShipBattleBuffVo()

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
		this.registerMsg(moduleId, 1, this.recLoadGuardShipInfo);
		this.registerMsg(moduleId, 2, this.recChallenge);
		this.registerMsg(moduleId, 3, this.recSweep);
		this.registerMsg(moduleId, 4, this.recLoadRankList);
		this.registerMsg(moduleId, -1, this.pushChallengeEnd);
		this.registerMsg(moduleId, -2, this.pushBuffSelectVos);
		this.registerMsg(moduleId, -3, this.pushUpdateRoundVo);
		this.registerMsg(moduleId, -4, this.pushBuffVo);
		this.registerMsg(moduleId, -5, this.pushStuffEffectVo);
		this.registerMsg(moduleId, -6, this.pushRefreshOptionalBuffs);
	}

	/**初始化数据 */
	public initData(): void {
		if (this.battleVo.constCfg == null) {
			let freeIconCfg = G.TableManager.getDataById(table.guardship.GuardShipConstantConfig, 'GUARD_SHIP:FREE_ICON')
			let challCost = G.TableManager.getDataById(table.guardship.GuardShipConstantConfig, 'GUARD_SHIP:EXTRA_CHALLENGE_COSTS')
			let maxItemCfg = G.TableManager.getDataById(table.guardship.GuardShipConstantConfig, 'GUARD_SHIP:MAX_USE_ITEM_COUNT')
			//{"NORMAL":1,"ELITE":5,"BOSS":100}
			let monsterExpCfg = G.TableManager.getDataById(table.guardship.GuardShipConstantConfig, 'GUARD_SHIP:MONSTER_TYPE_EXP_MAP')
			let monsterExpObj: object = {}
			if (monsterExpCfg) {
				try {
					monsterExpObj = JSON.parse(monsterExpCfg.content)
				} catch (e) {
					console.log('解析字段GUARD_SHIP:MONSTER_TYPE_EXP_MAP错误')
				}
			}

			this._freeIcon = freeIconCfg ? freeIconCfg.content : ''
			this._challengeCosts = challCost ? ItemUtils.parseStringToNoOwnerItemArray(challCost.content) : []
			let monsterExpMap: Map<number, number> = new Map()
			for (let key in monsterExpObj) {
				monsterExpMap.set(ServerEnums.MonsterType[String(key)], monsterExpObj[key])
			}
			let setCfg = BattleConfigManager.getBattleSettingConfig(FightType.GUARD_SHIP);
			this.battleVo.constCfg = {
				monsterExp: monsterExpMap,
				maxUseItemCnt: maxItemCfg ? Number(maxItemCfg.content) : 0,
				levelCfgs: G.TableManager.getAllData(table.guardship.GuardShipLevelConfig),
				maxMonsterCnt: setCfg?.monsterCreateMode?.maxAliveCnt ? setCfg?.monsterCreateMode?.maxAliveCnt : 0
			}
		}
		if (this._minFloor == 0) {
			let cfgs = G.TableManager.getAllData(table.guardship.GuardShipInstanceConfig)
			if (cfgs?.length > 0) {
				this._minFloor = cfgs[0].id
				this._maxFloor = cfgs[cfgs.length - 1].id
			}
		}
		this._curFloor = 0
		this.myRank = 0
	}

	/*********************************数据处理*********************************/

	/**每日免费次数*/
	public get freeTimes(): number {
		return this._freeTimes
	}

	/**免费图标*/
	public get freeIcon(): string {
		return this._freeIcon
	}

	/**挑战消耗*/
	public get challengeCosts(): NoOwnerItem[] {
		return this._challengeCosts
	}

	/**当前通关层数*/
	public get curFloor(): number {
		return this._curFloor
	}

	/**最小层数*/
	public get minFloor(): number {
		return this._minFloor
	}

	/**最大层数*/
	public get maxFloor(): number {
		return this._maxFloor
	}

	/**当前正在挑战关卡*/
	public get curChallFloor(): number {
		return this._curChallFloor
	}

	/**结算时间*/
	public get endTime(): number {
		return this._endTime
	}

	public updateEndTime(): void {
		let curWeek = G.TimeManager.getServerTimeWeekday().getHumanWeekDayNum()
		let nextMondayOffsetDay = 8 - curWeek
		this._endTime = G.TimeManager.todayZero + nextMondayOffsetDay * 24 * 60 * 60 * 1000
	}

	public deleteProp(itemId: number): void {
		let index = this.battleVo.curPropIds.indexOf(itemId)
		if (index != -1) {
			this.battleVo.curPropIds.splice(index, 1)
			this.emit(NotificationKey.GUARDSHIP_DROP_ITEM_CHANGE)
		}
	}

	/*********************************协议发送*********************************/

	/**
	 * 获取守卫母舰信息
	 * 模块号：46	指令号：1
	 */
	public sendLoadGuardShipInfo(): void {
		this.send(this.MODULE, 1);
	}

	/**
	 * 挑战
	 * 模块号：46	指令号：2
	 */
	public sendChallenge(c2s: Vo.guardship.ChallengeC2S): void {
		this._curChallFloor = c2s.instanceId
		this.send(this.MODULE, 2, c2s);
	}

	/**
	 * 扫荡
	 * 模块号：46	指令号：3
	 */
	public sendSweep(c2s: Vo.guardship.SweepC2S): void {
		this.send(this.MODULE, 3, c2s);
	}

	/**
	 * 获取排行榜列表
	 * 模块号：46	指令号：4
	 */
	public sendLoadRankList(c2s: Vo.guardship.LoadRankListC2S): void {
		this.send(this.MODULE, 4, c2s);
	}

	/*********************************协议监听*********************************/

	/**
	 * 获取守卫母舰信息
	 * 模块号：46	指令号：1
	 */
	public recLoadGuardShipInfo(data: Vo.guardship.LoadGuardShipInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			//布阵信息
			data.content.customFormationVos?.forEach((vo) => {
				GIns.formationMgr.updatePosDatas(vo)
			})

			this._freeTimes = data.content.freeChallengeTimes
			this._passInstanceIds = data.content.passInstanceIds ? data.content.passInstanceIds : []
			if (this._passInstanceIds.length > 0) {
				this._passInstanceIds.sort((a, b) => {
					return a - b
				})
				this._curFloor = this._passInstanceIds[this._passInstanceIds.length - 1]
			} else {
				this._curFloor = 0
			}
			this.updateEndTime()
			this.emit(NotificationKey.GUARDSHIP_UPDATE_INFO)
		}
	}

	/**
	 * 挑战
	 * 模块号：46	指令号：2
	 */
	public recChallenge(data: Vo.guardship.ChallengeS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content)
			}
		}
	}

	/**
	 * 扫荡
	 * 模块号：46	指令号：3
	 */
	public recSweep(data: Vo.guardship.SweepS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content.costs) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costs)
			}
			if (data.content?.rewards?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewards);
			}
			if (this._freeTimes > 0) {
				this._freeTimes--
			}
			this.emit(NotificationKey.GUARDSHIP_SWEEP_COMPLETE)
		}
	}

	/**
	 * 获取排行榜列表
	 * 模块号：46	指令号：4
	 */
	public recLoadRankList(data: Vo.guardship.LoadRankListS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			const content = data.content;
			this.myRank = data.content.rank
			G.FacadeManager.emit(NotificationKey.RANK_ON_DATA_RESP, EventRankDataResp.createByGuardShip(content));
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送挑战结束，GuardShipChallengeVo
	 * 模块号：46	指令号：-1
	 */
	public pushChallengeEnd(vo: Vo.guardship.GuardShipChallengeVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this._freeTimes = vo.freeChallengeTimes
		let isFloorChange: boolean = false
		if (vo.win) {
			if (this._passInstanceIds.indexOf(vo.instanceId) == -1) {
				this._passInstanceIds.push(vo.instanceId)
			}
			if (this._curFloor < vo.instanceId) {
				this._curFloor = vo.instanceId
				isFloorChange = true
			}
			if (vo.rewardResults) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, vo.rewardResults);
			}
		}
		this.emit(NotificationKey.GUARDSHIP_CHALLENGE_COMPLETE, isFloorChange);
		let resultVo: IBattleResultVo = { isWin: vo.win, fightType: FightType.GUARD_SHIP };
		this.emit(NotificationKey.BATTLE_RESULT, resultVo);
		this.emit(NotificationKey.BATTLE_RESULT_WIN, {
			fightType: FightType.GUARD_SHIP, exData: CommonBattleResultViewOpenArgs.create(
				vo.win,
				false,
				NoOwnerItem.createByServerReward(vo.rewardResults),
				null,
				FightType.GUARD_SHIP,
				0
			), isWin: vo.win
		} as IBattleResultWinData)
	}

	/**
		 * 推送Buff选择列表，List<GuardShipBuffSelectVo>
		 * 模块号：46	指令号：-2
		 */
	public pushBuffSelectVos(vos: Vo.guardship.GuardShipBuffSelectVo[]): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		vos?.forEach((vo) => {
			if (vo.instanceId == this.battleVo.instanceCfg?.id) {
				this.battleVo.waitSelectBuffs.push({ level: vo.level, optionalCount: vo.optionalCount, selectGroupCount: vo.selectGroupCount, selectCount: 0, buffIds: [] })
			}
		})
		this.emit(NotificationKey.GUARDSHIP_SELECT_BUFF_UPDATE)
	}

	/**
	 * 推送更新波次，GuardShipRoundVo
	 * 模块号：46	指令号：-3
	 */
	public pushUpdateRoundVo(vo: Vo.guardship.GuardShipRoundVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (vo.instanceId == this.battleVo.instanceCfg?.id) {
			if (this.battleVo.curRoundCfg?.id != vo.round) {
				let index = this.battleVo.roundCfgs?.findIndex((value) => value.id == vo.round)
				if (index != -1) {
					this.battleVo.curRoundIdx = index
					this.emit(NotificationKey.GUARDSHIP_ROUND_UPDATE)
				}
			}
		}
	}

	/**
	 * 推送Buff信息，GuardShipBuffVo
	 * 模块号：46	指令号：-4
	 */
	public pushBuffVo(vo: Vo.guardship.GuardShipBuffVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (vo.instanceId == this.battleVo.instanceCfg?.id) {
			this.battleBuffVo.addBuff(vo.buffId, vo.level)
			let index = this.battleVo.waitSelectBuffs.findIndex((value) => value.level == vo.level)
			if (index != -1) {
				let waitData = this.battleVo.waitSelectBuffs[index]
				if (waitData.selectCount >= waitData.selectGroupCount) {
					//代表选完了
					this.battleVo.waitSelectBuffs.splice(index, 1)
				}
			}
			this.emit(NotificationKey.GUARDSHIP_BUFF_UPDATE, vo.buffId)

			if (this.battleVo.waitSelectBuffs.length <= 0) {
				this.emit(NotificationKey.GUARDSHIP_SELECT_BUFF_COMPLETE)
			}
		}
	}

	/**
	 * 推送经验相关信息，GuardShipStuffEffectVo
	 * 模块号：46	指令号：-5
	 */
	public pushStuffEffectVo(vo: Vo.guardship.GuardShipStuffEffectVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.battleVo.resetExpByServer(vo.exp)
		this.battleVo.stuffEffect.expRatio = vo.expRatio
		this.battleVo.stuffEffect.extraBuffRate = vo.extraBuffRate
		this.battleVo.stuffEffect.extraBuffOptionalCount = vo.extraBuffOptionalCount
		this.battleVo.stuffEffect.extraItemDropRate = vo.extraItemDropRate
		this.emit(NotificationKey.GUARDSHIP_STUFF_EFFECT_UPDATE)
	}

	/**
	 * 推送刷新Buff信息，GuardShipRefreshBuffVo
	 * 模块号：46	指令号：-6
	 */
	public pushRefreshOptionalBuffs(vo: Vo.guardship.GuardShipRefreshBuffVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (vo.costItemResults?.length > 0) {
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, vo.costItemResults)
		}
		if (vo.instanceId == this.battleVo.instanceCfg?.id) {
			this.battleBuffVo.refreshTimes = vo.refreshCount
			let waitData = this.battleVo.waitSelectBuffs.find((value) => value.level == vo.level)
			if (waitData) {
				waitData.selectCount = vo.groupIndex + 1
				waitData.buffIds[vo.groupIndex] = vo.buffIds
			}
			this.emit(NotificationKey.GUARDSHIP_SELECT_BUFF_REFRESH)
		}

	}

}
