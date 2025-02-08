import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { DateUtils } from "../../../../core/utils/DateUtils";
import { TableConstUtils } from "../../../../core/utils/TableConstUtils";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { FactoryProductLineState } from "../const/FactoryEnum";
import { FactoryBattleResultViewOpenArgs } from "../const/UIFactoryConfig";
import { IFactoryConstCfg } from "./vo/IFactoryConstCfg";
import { IFactoryRankRecData } from "./vo/IFactoryRankRecData";
import { IFactoryRecord } from "./vo/IFactoryRecord";

/**
 * 星际工厂模块协议号
 * @author GameCreator
 */
export class FactoryModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 49;

	protected _constCfg: IFactoryConstCfg = null

	protected _myVo: Vo.factory.PlayerFactoryVo = null
	/**所有生产线数据 包括自己 id为生产线id*/
	protected _allProductLineVoMap: Map<number, Vo.factory.ProductLineVo> = new Map()
	/**其他人的玩家信息*/
	protected _otherInfoMap: Map<number, Vo.factory.PlayerFactoryVisitVo> = new Map()
	/**记录是否改变 需要重新请求记录*/
	protected _isRecordChange: boolean = true
	/**战报*/
	protected _records: IFactoryRecord[] = []
	/**好友工厂列表*/
	protected _friends: Vo.factory.PlayerFactoryBaseVo[] = []
	/**排行榜列表*/
	protected _ranks: Vo.factory.PlayerFactoryBaseVo[] = []
	/**排行榜接口返回的数据*/
	protected _rankRecData: IFactoryRankRecData = null
	/**所有工厂配置奖励*/
	protected _rewardsMap: Map<number, { k: any, v: any }[]> = new Map()
	/**所有工厂占领时间*/
	protected _occupyTimeMap: Map<string, number> = new Map()
	/**最大同时占领数量*/
	protected _maxSameTimeOccupyCount: number = 0
	/**下一次解锁占领数量等级*/
	protected _occupyCntUnlockLvs: number[] = []
	/**气泡配置分类*/
	protected _bubbleMap:Map<number, table.factory.FactoryRecordBubbleTipConfig[]> = new Map();

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
		this.registerMsg(moduleId, 1, this.recLoadFactoryInfo);
		this.registerMsg(moduleId, 2, this.recVisitFactoryInfo);
		this.registerMsg(moduleId, 3, this.recOccupyProductLine);
		this.registerMsg(moduleId, 4, this.recCancelOccupy);
		this.registerMsg(moduleId, 5, this.recDrawProductLine);
		this.registerMsg(moduleId, 6, this.recBuyPower);
		this.registerMsg(moduleId, 7, this.recLoadFactoryRecord);
		this.registerMsg(moduleId, 8, this.recLoadFriendFactoryInfo);
		this.registerMsg(moduleId, 9, this.recLoadFactoryRank);
		this.registerMsg(moduleId, 10, this.recVisitProductLineInfo);
		this.registerMsg(moduleId, 11, this.recReadFactoryRecord);
		this.registerMsg(moduleId, 12, this.recDelFactoryRecord);
		this.registerMsg(moduleId, -1, this.pushFactoryOccupyResult);
		this.registerMsg(moduleId, -2, this.pushFactoryBeOccupy);
		this.registerMsg(moduleId, -3, this.pushFactoryOwnerBeOccupy);
		this.registerMsg(moduleId, -4, this.pushCancelBeOccupy);

	}

	/**初始化数据 */
	public initData(): void {
		this._isRecordChange = true

		if (this._constCfg == null) {
			//初始化静态配置
			this._constCfg = {
				maxPower: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:MAX_POWER'),
				powerRecoverInterval: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:POWER_RECOVER_INTERVAL'),
				occupyCostPower: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:OCCUPY_COST_POWER'),
				buyOnePowerCosts: TableConstUtils.getConstConfigToKV(table.factory.FactoryConstantConfig, 'FACTORY:BUY_ONE_POWER_COSTS'),
				occupySkipOneMinutesCosts: TableConstUtils.getConstConfigToKV(table.factory.FactoryConstantConfig, 'FACTORY:OCCUPY_SKIP_ONE_MINUTES_COSTS'),
				occupyProductLineMaxCount: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:OCCUPY_PRODUCT_LINE_MAX_COUNT'),
				recordExpireMinutes: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:RECORD_EXPIRE_MINUTES'),
				battleConfigId: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:BATTLE_ID'),
				powerIcon: TableConstUtils.getConstConfig(table.factory.FactoryConstantConfig, 'FACTORY:POWER_ICON'),
				dailyOccupyRewardTimes: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:DAILY_OCCUPY_REWARD_TIMES'),
				productLineRefreshInterval: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:PRODUCT_LINE_REFRESH_INTERVAL'),
				maxRecordCount: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:MAX_RECORD_COUNT'),
				bubbleInterval: TableConstUtils.getConstConfigToNumber(table.factory.FactoryConstantConfig, 'FACTORY:BUBBLE_INTERVAL'),
			}

			let allCfgs = G.TableManager.getAllData(table.factory.FactoryOccupyLimitsConfig)
			let defaultLv: number = 1
			if (allCfgs?.length > 0) {
				defaultLv = allCfgs[allCfgs.length - 1].id
			}
			this._occupyCntUnlockLvs = new Array(this._constCfg.occupyProductLineMaxCount).fill(defaultLv)
			for (let i = allCfgs?.length - 1; i >= 0; i--) {
				this._occupyCntUnlockLvs[allCfgs[i].sameTimeOccupyCount - 1] = allCfgs[i].id
			}
		}
	}

	/*********************************数据处理*********************************/
	/**静态配置*/
	public get constCfg(): IFactoryConstCfg {
		return this._constCfg
	}

	/**我的工厂信息*/
	public get myVo(): Vo.factory.PlayerFactoryVo {
		return this._myVo
	}

	/**所有生产线数据 包括自己*/
	public get allProductLineVoMapVo(): Map<number, Vo.factory.ProductLineVo> {
		return this._allProductLineVoMap
	}

	/**其他人的玩家信息*/
	public get otherInfoMap(): Map<number, Vo.factory.PlayerFactoryVisitVo> {
		return this._otherInfoMap
	}

	/**战报列表*/
	public get records(): IFactoryRecord[] {
		return this._records
	}

	/**好友列表*/
	public get friends(): Vo.factory.PlayerFactoryBaseVo[] {
		return this._friends
	}

	/**排行榜列表*/
	public get ranks(): Vo.factory.PlayerFactoryBaseVo[] {
		return this._ranks
	}

	/**最大同时占领数量*/
	public get maxSameTimeOccupyCount(): number {
		return this._maxSameTimeOccupyCount
	}

	/**获取解锁占领数量所需等级*/
	public getUnlockOccupyCountLv(index: number): number {
		if (index >= 0 && index < this._occupyCntUnlockLvs.length) {
			return this._occupyCntUnlockLvs[index]
		}
		return 1
	}

	/**更新同时最大占领数量*/
	public updateMaxSameTimeOccupyCount(): void {
		let count: number = 0
		let allCfgs = G.TableManager.getAllData(table.factory.FactoryOccupyLimitsConfig)
		if (allCfgs?.length > 0) {
			let playerLv: number = GIns.formationMgr.getCommonLevel()
			let index = allCfgs.findIndex((value) => value.id > playerLv)
			if (index == -1) {
				//找不到配置就当最后一条配置
				index = allCfgs.length - 1
			} else {
				index = Math.max(0, index - 1)
			}
			count = allCfgs[index].sameTimeOccupyCount
		}
		if (this._maxSameTimeOccupyCount != count) {
			this._maxSameTimeOccupyCount = count
			this.emit(NotificationKey.FACTORY_MAX_OCCUPY_COUNT_CHANGE)
		}
	}

	/**获取其他玩家信息*/
	public getVisitInfo(playerId: number): Vo.factory.PlayerFactoryVisitVo {
		if (this._otherInfoMap.has(playerId)) {
			return this._otherInfoMap.get(playerId)
		}
		return null
	}

	/**获取生产线详情*/
	public getProductLineForVisit(playerId: number): Vo.factory.ProductLineVo {
		if (this._otherInfoMap.has(playerId)) {
			return this._otherInfoMap.get(playerId).productLineVo
		}
		return null
	}

	/**获取生产线详情*/
	public getProductLineVo(productLineId: number): Vo.factory.ProductLineVo {
		if (this._allProductLineVoMap.has(productLineId)) {
			return this._allProductLineVoMap.get(productLineId)
		}
		return null
	}

	/**获取生产线奖励预览*/
	public getProdectLineRewards(productLineConfigId: number): { k: any, v: any }[] {
		if (this._rewardsMap.has(productLineConfigId)) {
			return this._rewardsMap.get(productLineConfigId)
		}
		let rewards: { k: any, v: any }[] = []
		if (productLineConfigId > 0) {
			let cfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, productLineConfigId)
			if (cfg) {
				rewards = cfg.rewards
			}
			this._rewardsMap.set(productLineConfigId, rewards)
		}
		return rewards
	}

	/**获取占领所需时间*/
	public getProdectLineOccupyTime(quality: number): number {
		let id: number = this._myVo.todayOccupyTimes ? this._myVo.todayOccupyTimes + 1 : 1
		let key: string = id + "_" + quality
		if (this._occupyTimeMap.has(key)) {
			return this._occupyTimeMap.get(key)
		}
		let time: number = 0
		let cfg = G.TableManager.getDataById(table.factory.FactoryRewardTimeConfig, id)
		if (cfg && cfg?.quality2RewardTime) {
			let data = cfg?.quality2RewardTime?.find((value) => value.k == quality)
			if (data) {
				time = Number(data.v)
			}
		}
		this._occupyTimeMap.set(key, time)
		return time
	}

	/**我的生产线状态*/
	public getMyProductLineState(hasRewardState: boolean = false): FactoryProductLineState {
		let state: FactoryProductLineState = FactoryProductLineState.Idle
		if (this._myVo?.selfProductLineVo) {
			let nowTime: number = G.TimeManager.serverNow
			let endTime: number = this._myVo.selfProductLineVo.endTime
			if (endTime > 0 && endTime <= nowTime) {
				//结束了
				if (hasRewardState && this._myVo.selfProductLineVo?.occupyPlayerId == GIns.playerModel.playerId) {
					//是我占领的结束了
					state = FactoryProductLineState.OccupiedComplete
				} else {
					state = FactoryProductLineState.Idle
				}
			} else if (this._myVo.selfProductLineVo.occupyPlayerId > 0) {
				if (endTime > nowTime) {
					state = FactoryProductLineState.Occupied
				}
			} else if (this._myVo.selfProductLineVo.productLineId > 0) {
				state = FactoryProductLineState.NotOccupied
			}
		}
		return state
	}

	/**生产线状态*/
	public getProductLineStateForVisit(belongPlayerId: number, hasRewardState: boolean = false): FactoryProductLineState {
		if (belongPlayerId == GIns.playerModel.playerId) {
			//我的生产线
			return this.getMyProductLineState(hasRewardState)
		}
		let state: FactoryProductLineState = FactoryProductLineState.Idle
		if (this._otherInfoMap.has(belongPlayerId)) {
			let vo = this._otherInfoMap.get(belongPlayerId).productLineVo
			return this.getProductLineState(vo, hasRewardState)
		}
		return state
	}

	/**生产线状态*/
	public getProductLineStateById(productLineId: number, hasRewardState: boolean = false): FactoryProductLineState {
		if (productLineId == this.myVo?.selfProductLineVo?.productLineId) {
			//我的生产线
			return this.getMyProductLineState(hasRewardState)
		}
		let state: FactoryProductLineState = FactoryProductLineState.Idle
		if (this._allProductLineVoMap.has(productLineId)) {
			return this.getProductLineState(this._allProductLineVoMap.get(productLineId), hasRewardState)
		}
		return state
	}

	/**生产线状态*/
	public getProductLineState(vo: Vo.factory.ProductLineVo, hasRewardState: boolean = false): FactoryProductLineState {
		let state: FactoryProductLineState = FactoryProductLineState.Idle
		if (vo) {
			let nowTime: number = G.TimeManager.serverNow
			if (vo.endTime > 0 && vo.endTime <= nowTime) {
				//结束了
				if (hasRewardState && this._myVo.selfProductLineVo?.occupyPlayerId == GIns.playerModel.playerId) {
					//是我占领的结束了
					state = FactoryProductLineState.OccupiedComplete
				} else {
					state = FactoryProductLineState.Idle
				}
			} else if (vo.occupyPlayerBaseVo) {
				if (vo.endTime > nowTime) {
					state = FactoryProductLineState.Occupied
				}
			} else if (vo.productLineId > 0) {
				state = FactoryProductLineState.NotOccupied
			} else {
				state = FactoryProductLineState.Idle
			}
		}
		return state
	}

	/**根据是否已读状态获取的战报id列表*/
	public getRecordIdsByReadState(isRead: boolean): number[] {
		let recordIds: number[] = []
		this._records?.forEach((value) => {
			if (value?.vo.read == isRead) {
				recordIds.push(value.vo.id)
			}
		})
		return recordIds
	}

	/**我的占领队列是否已满*/
	public isMyOccupyListFull(): boolean {
		if (this._myVo?.occupyProductLineVos) {
			return this._myVo.occupyProductLineVos.length >= this._maxSameTimeOccupyCount
		}
		return true
	}

	/**尝试刷新战报*/
	public tryToRefreshRecord(): void {
		if (this._isRecordChange) {
			this.sendLoadFactoryRecord()
		}
	}

	public RequestRankByIndex(index: number): void {
		if (this._rankRecData && this._ranks.length > index) {
			let page = Math.ceil((index + 1) / this._rankRecData?.pageSize)
			this.sendLoadFactoryRank({ page: page })
		}
	}

	/**按照类型获取气泡列表*/
	public getBubbleListByType(type:number):table.factory.FactoryRecordBubbleTipConfig[] {
		if (this._bubbleMap.size <= 0) {
			//初始化
			let allCfgs = G.TableManager.getAllData(table.factory.FactoryRecordBubbleTipConfig);
			allCfgs?.forEach((cfg) => {
				let arr = null;
				if (this._bubbleMap.has(cfg.type)) {
					arr = this._bubbleMap.get(cfg.type);
				} else {
					arr = [];
					this._bubbleMap.set(cfg.type, arr);
				}
				arr.push(cfg);
			})
		}
		if (this._bubbleMap.has(type)) {
			return this._bubbleMap.get(type);
		}
		return [];
	}

	/**通过生产线更新其他数据*/
	protected updateProductLineVo(data: Vo.factory.ProductLineVo): void {
		if (data == null) {
			return
		}
		let targetProductLineVo: Vo.factory.ProductLineBriefVo = null
		let myPlayerId:number = GIns.playerModel.playerId
		let isMine: boolean = data.productLineId == this._myVo.selfProductLineVo?.productLineId
		if (isMine) {
			//自己的生产线
			targetProductLineVo = this._myVo.selfProductLineVo
		} else {
			if (!this._myVo.occupyProductLineVos) {
				this._myVo.occupyProductLineVos = []
			}
			let index = this._myVo.occupyProductLineVos.findIndex((value) => value.productLineId == data.productLineId)
			if (index != -1) {
				targetProductLineVo = this._myVo.occupyProductLineVos[index]
			} else if (data.occupyPlayerBaseVo?.id == myPlayerId) {
				//被我占领了
				targetProductLineVo = {
					productLineId: 0,
					belongPlayerId: 0,
					endTime: 0,
					occupyPlayerId: 0,
					productLineConfigId: 0,
					startTime: 0,
				}
				this._myVo.occupyProductLineVos.push(targetProductLineVo)
			}
		}
		this._allProductLineVoMap.set(data.productLineId, data)
		let visitInfo: Vo.factory.PlayerFactoryVisitVo = this.getVisitInfo(data.belongPlayerBaseVo?.id)
		if (visitInfo) {
			visitInfo.productLineVo = data
			if (data.endTime > 0) {
				visitInfo.lastProductLineEndTime = data.endTime
			}
		}
		if (targetProductLineVo) {
			//更新简要信息
			this.copyProductLineVoToBrief(data, targetProductLineVo)
		}
		this.emit(NotificationKey.FACTORY_PRODUCT_LINE_UPDATE, data.productLineId)
	}

	/**复制全量信息到简短信息*/
	protected copyProductLineVoToBrief(from: Vo.factory.ProductLineVo, to: Vo.factory.ProductLineBriefVo): Vo.factory.ProductLineBriefVo {
		if (!from || !to) {
			return
		}
		to.productLineId = from.productLineId
		to.belongPlayerId = from.belongPlayerBaseVo.id
		to.endTime = from.endTime
		to.occupyPlayerId = from.occupyPlayerBaseVo ? from.occupyPlayerBaseVo.id : 0
		to.productLineConfigId = from.productLineConfigId
		to.startTime = from.startTime
	}

	protected copyVoToIRecord(vo: Vo.factory.FactoryRecord): IFactoryRecord {
		let productLineCfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, vo.productLineConfigId)
		let cfgId: number = vo.defend ? 1 : 2
		let cfg = G.TableManager.getDataById(table.factory.FactoryRecordDescConfig, cfgId)
		let record: IFactoryRecord = {
			vo: vo,
			title: cfg ? cfg.title : '',
			content: cfg ? G.I18nManager.lang(cfg.content, productLineCfg ? productLineCfg.name : '', vo.attackerBaseVo?.name) : '',
			timeStr: DateUtils.dateTimeFormat(vo.time, 'yy年MM月dd日hh:mm:ss')
		}
		return record
	}

	/**删除生产线信息*/
	protected deleteProductLineVo(productLineId: number): void {
		let isMine: boolean = productLineId == this._myVo.selfProductLineVo?.productLineId
		if (isMine) {
			//清空占领信息
			this._myVo.selfProductLineVo = null
		}
		//移除我的占领信息
		let index = this._myVo.occupyProductLineVos?.findIndex((value) => value.productLineId == productLineId)
		if (index != -1) {
			this._myVo.occupyProductLineVos.splice(index, 1)
		}
		if (this._allProductLineVoMap.has(productLineId)) {
			let vo = this._allProductLineVoMap.get(productLineId)
			let visitInfo: Vo.factory.PlayerFactoryVisitVo = this.getVisitInfo(vo.belongPlayerBaseVo?.id)
			if (visitInfo) {
				visitInfo.productLineVo = null
			}
			this._allProductLineVoMap.delete(productLineId)
		}
		this.emit(NotificationKey.FACTORY_PRODUCT_LINE_UPDATE, productLineId)
	}

	/**处理我的占领结果*/
	protected handleOccupyProductLineResult(data: Vo.factory.OccupyProductLineResultVo): void {
		if (!this._myVo) {
			return
		}
		this._myVo.powerVo = data.powerVo
		if (data.occupy) {
			//占领成功 更新生产线信息
			this._myVo.todayOccupyTimes++
			this._myVo.occupyCollectiblesIdMap = data.occupyCollectiblesIdMap
			this._myVo.occupyHeroBaseIdMap = data.occupyHeroBaseIdMap
			this._myVo.occupyPetBaseIdMap = data.occupyPetBaseIdMap
			this.updateProductLineVo(data.productLineVo)

			this.emit(NotificationKey.FACTORY_UPDATE_INFO)
		} else if (data.productLineVo) {
			this.updateProductLineVo(data.productLineVo)
		}
	}

	/*********************************协议发送*********************************/

	/**
	 * 加载星际工厂信息
	 * 模块号：49	指令号：1
	 */
	public sendLoadFactoryInfo(): void {
		this.send(this.MODULE, 1);
	}

	/**
	 * 查看其他玩家工厂信息
	 * 模块号：49	指令号：2
	 */
	public sendVisitFactoryInfo(c2s: Vo.factory.VisitFactoryInfoC2S): void {
		this.send(this.MODULE, 2, c2s, c2s);
	}

	/**
	 * 占领生产线
	 * 模块号：49	指令号：3
	 */
	public sendOccupyProductLine(c2s: Vo.factory.OccupyProductLineC2S): void {
		this.send(this.MODULE, 3, c2s);
	}

	/**
	 * 取消占领
	 * 模块号：49	指令号：4
	 */
	public sendCancelOccupy(c2s: Vo.factory.CancelOccupyC2S): void {
		this.send(this.MODULE, 4, c2s);
	}

	/**
	 * 领取生产线奖励
	 * 模块号：49	指令号：5
	 */
	public sendDrawProductLine(c2s: Vo.factory.DrawProductLineC2S): void {
		this.send(this.MODULE, 5, c2s);
	}

	/**
	 * 购买体力
	 * 模块号：49	指令号：6
	 */
	public sendBuyPower(c2s: Vo.factory.BuyPowerC2S): void {
		this.send(this.MODULE, 6, c2s);
	}

	/**
	 * 加载星际工厂战报
	 * 模块号：49	指令号：7
	 */
	public sendLoadFactoryRecord(): void {
		this.send(this.MODULE, 7);
	}

	/**
	 * 加载好友星际工厂信息
	 * 模块号：49	指令号：8
	 */
	public sendLoadFriendFactoryInfo(): void {
		this.send(this.MODULE, 8);
	}

	/**
	 * 加载星际工厂排行榜
	 * 模块号：49	指令号：9
	 */
	public sendLoadFactoryRank(c2s: Vo.factory.LoadFactoryRankC2S): void {
		if (c2s.page == 1) {
			//第一页初始化数据
			this._ranks.length = 0
			this._rankRecData = null
		}
		this.send(this.MODULE, 9, c2s);
	}

	/**
	 * 查看生产线信息
	 * 模块号：49	指令号：10
	 */
	public sendVisitProductLineInfo(c2s: Vo.factory.VisitProductLineInfoC2S): void {
		this.send(this.MODULE, 10, c2s);
	}

	/**
	 * 阅读战报
	 * 模块号：49	指令号：11
	 */
	public sendReadFactoryRecord(c2s: Vo.factory.ReadFactoryRecordC2S): void {
		this.send(this.MODULE, 11, c2s, c2s);
	}

	/**
	 * 删除战报
	 * 模块号：49	指令号：12
	 */
	public sendDelFactoryRecord(c2s: Vo.factory.DelFactoryRecordC2S): void {
		this.send(this.MODULE, 12, c2s, c2s);
	}

	/*********************************协议监听*********************************/

	/**
	 * 加载星际工厂信息
	 * 模块号：49	指令号：1
	 */
	public recLoadFactoryInfo(data: Vo.factory.LoadFactoryInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._myVo = data.content
			this.emit(NotificationKey.FACTORY_UPDATE_INFO)
		}
	}

	/**
	 * 查看其他玩家工厂信息
	 * 模块号：49	指令号：2
	 */
	public recVisitFactoryInfo(data: Vo.factory.VisitFactoryInfoS2C, c2s: Vo.factory.VisitFactoryInfoC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._otherInfoMap.set(data.content.playerBaseVo.id, data.content)
			if (data.content.productLineVo) {
				this.updateProductLineVo(data.content.productLineVo)
			}
			this.emit(NotificationKey.FACTORY_VISIT_UPDATE, data.content.playerBaseVo?.id)
		}
	}

	/**
	 * 占领生产线
	 * 模块号：49	指令号：3
	 */
	public recOccupyProductLine(data: Vo.factory.OccupyProductLineS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content.fight == false) {
				//非战斗占领 在返回里面处理 战斗在推送处理
				this.handleOccupyProductLineResult(data.content)
				this.emit(NotificationKey.FACTORY_OCCUPY_COMPLETE, data.content.occupy)
			}
		}
	}

	/**
	 * 取消占领
	 * 模块号：49	指令号：4
	 */
	public recCancelOccupy(data: Vo.factory.CancelOccupyS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			//清空占领角色技能信息
			this._myVo.occupyCollectiblesIdMap = data.content.occupyCollectiblesIdMap
			this._myVo.occupyHeroBaseIdMap = data.content.occupyHeroBaseIdMap
			this._myVo.occupyPetBaseIdMap = data.content.occupyPetBaseIdMap
			this._myVo.todayOccupyTimes--
			let isMine: boolean = data.content.productLineId == this._myVo.selfProductLineVo?.productLineId
			if (isMine) {
				//清空占领信息
				this._myVo.selfProductLineVo.occupyPlayerId = 0
				this._myVo.selfProductLineVo.startTime = 0
				this._myVo.selfProductLineVo.endTime = 0
			} else {
				//其他人的 就直接移除
				let index = this._myVo.occupyProductLineVos?.findIndex((value) => value.productLineId == data.content.productLineId)
				if (index != -1) {
					this._myVo.occupyProductLineVos.splice(index, 1)
				}
			}
			if (this._allProductLineVoMap.has(data.content.productLineId)) {
				let vo = this._allProductLineVoMap.get(data.content.productLineId)
				vo.occupyPlayerBaseVo = null
				vo.startTime = 0
				vo.endTime = 0
				let visitInfo: Vo.factory.PlayerFactoryVisitVo = this.getVisitInfo(vo.belongPlayerBaseVo?.id)
				if (visitInfo) {
					visitInfo.productLineVo = vo
				}
			}
			this.emit(NotificationKey.FACTORY_PRODUCT_LINE_UPDATE, data.content.productLineId)
		}
	}

	/**
	 * 领取生产线奖励
	 * 模块号：49	指令号：5
	 */
	public recDrawProductLine(data: Vo.factory.DrawProductLineS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content?.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
			}
			if (data.content?.rewardResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
			}

			this._myVo.occupyCollectiblesIdMap = data.content.occupyCollectiblesIdMap
			this._myVo.occupyHeroBaseIdMap = data.content.occupyHeroBaseIdMap
			this._myVo.occupyPetBaseIdMap = data.content.occupyPetBaseIdMap
			this._myVo.todayOccupyRewardTimes = data.content.todayOccupyRewardTimes

			this.deleteProductLineVo(data.content.productLineId)
		}
	}

	/**
	 * 购买体力
	 * 模块号：49	指令号：6
	 */
	public recBuyPower(data: Vo.factory.BuyPowerS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content?.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
			}
			this._myVo.powerVo = data.content.powerVo
			this.emit(NotificationKey.FACTORY_POWER_UPDATE)
			this.emit(NotificationKey.FACTORY_BUY_POWER_COMPLETE)
		}
	}

	/**
	 * 加载星际工厂战报
	 * 模块号：49	指令号：7
	 */
	public recLoadFactoryRecord(data: Vo.factory.LoadFactoryRecordS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._isRecordChange = false
			this._records = data.content.map((value) => this.copyVoToIRecord(value))
			this._records.sort((a, b) => {
				return b.vo.time - a.vo.time
			})
			this.emit(NotificationKey.FACTORY_RECORD_UPDATE)
		}
	}

	/**
	 * 加载好友星际工厂信息
	 * 模块号：49	指令号：8
	 */
	public recLoadFriendFactoryInfo(data: Vo.factory.LoadFriendFactoryInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._friends = data.content
			this.emit(NotificationKey.FACTORY_FRIEND_UPDATE)
		}
	}

	/**
	 * 加载星际工厂排行榜
	 * 模块号：49	指令号：9
	 */
	public recLoadFactoryRank(data: Vo.factory.LoadFactoryRankS2C, c2s: Vo.factory.LoadFactoryRankC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._rankRecData = data.content as IFactoryRankRecData
			if (this._rankRecData) {
				if (this._ranks.length != this._rankRecData.total) {
					this._ranks.length = this._rankRecData.total
				}
				let startIndex = (this._rankRecData.curPage - 1) * this._rankRecData.pageSize
				for (let i = 0; i < this._rankRecData.data.length; i++) {
					this._ranks[startIndex + i] = this._rankRecData.data[i].baseVo
				}
			}
			this.emit(NotificationKey.FACTORY_RANK_UPDATE, data.content)
		}
	}

	/**
	 * 查看生产线信息
	 * 模块号：49	指令号：10
	 */
	public recVisitProductLineInfo(data: Vo.factory.VisitProductLineInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content.productLineVo) {
				this.updateProductLineVo(data.content.productLineVo)
			} else {
				this.deleteProductLineVo(data.content.produceLineId)
			}
		}
	}

	/**
	 * 阅读战报
	 * 模块号：49	指令号：11
	 */
	public recReadFactoryRecord(data: Vo.factory.ReadFactoryRecordS2C, c2s: Vo.factory.ReadFactoryRecordC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			c2s.recordIds?.forEach((id) => {
				let recordVo = this._records?.find((value) => value.vo.id == id)
				if (recordVo) {
					recordVo.vo.read = true
				}
			})
			this.emit(NotificationKey.FACTORY_RECORD_UPDATE)
			this.emit(NotificationKey.FACTORY_RECORD_READ, c2s.recordIds)
		}
	}

	/**
	 * 删除战报
	 * 模块号：49	指令号：12
	 */
	public recDelFactoryRecord(data: Vo.factory.DelFactoryRecordS2C, c2s: Vo.factory.DelFactoryRecordC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			c2s.recordIds?.forEach((id) => {
				let index = this._records?.findIndex((value) => value.vo.id == id)
				if (index != -1) {
					this._records.splice(index, 1)
				}
			})
			this.emit(NotificationKey.FACTORY_RECORD_UPDATE)
			this.emit(NotificationKey.FACTORY_RECORD_DEL, c2s.recordIds)
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送生产线占领结果,OccupyProductLineResultVo
	 * 模块号：49	指令号：-1
	 */
	public pushFactoryOccupyResult(data: Vo.factory.OccupyProductLineResultVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (data.occupy == false) {
			if (data.productLineVo == null) {
				//生产线已经被领取奖励了
				this.deleteProductLineVo(data.productLineId)
				GIns.factoryMgr.occupyTip = '生产线状态变化，体力消耗已返回'
			} else if (data.productLineVo.occupyPlayerBaseVo == null) {
				//原先的占领取消了
				GIns.factoryMgr.occupyTip = '生产线状态变化，体力消耗已返回'
			} else {
				//占领失败时 判断前后占领者是否变化 变了 那就是被人截了
				let oldProductVo = this._allProductLineVoMap.get(data.productLineVo.productLineId)
				if (oldProductVo && oldProductVo.occupyPlayerBaseVo && oldProductVo.occupyPlayerBaseVo.id != data.productLineVo.occupyPlayerBaseVo?.id) {
					GIns.factoryMgr.occupyTip = '生产线状态变化，体力消耗已返回'
				}
			}
		}

		this.handleOccupyProductLineResult(data)
		let cfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, data.productLineVo?.productLineConfigId)
		this.emit(NotificationKey.BATTLE_RESULT_WIN, {
			fightType: FightType.FACTORY,
			isWin: data.occupy,
			exData: FactoryBattleResultViewOpenArgs.create(
				data.occupy,
				FightType.FACTORY,
				cfg ? cfg.name : '',
			)
		} as IBattleResultWinData)
	}

	/**
	 * 推送生产线被占领,FactoryProductLineBeOccupyVo
	 * 模块号：49	指令号：-2
	 */
	public pushFactoryBeOccupy(data: Vo.factory.FactoryProductLineBeOccupyVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this._records.unshift(this.copyVoToIRecord(data.record))
		if (this._records.length > this.constCfg.maxRecordCount) {
			this._records.pop()
		}
		this.emit(NotificationKey.FACTORY_RECORD_UPDATE)
		if (data.defend == false) {
			//代表防守失败了
			//清空占领角色技能信息
			this._myVo.occupyCollectiblesIdMap = data.occupyCollectiblesIdMap
			this._myVo.occupyHeroBaseIdMap = data.occupyHeroBaseIdMap
			this._myVo.occupyPetBaseIdMap = data.occupyPetBaseIdMap
			this._myVo.todayOccupyTimes = data.todayOccupyTimes
			let isMine: boolean = data.productLineId == this._myVo.selfProductLineVo?.productLineId
			if (isMine) {
				//清空占领信息
				this._myVo.selfProductLineVo.occupyPlayerId = data.record.attackerBaseVo.id
			} else {
				//其他人的 就直接移除
				let index = this._myVo.occupyProductLineVos?.findIndex((value) => value.productLineId == data.productLineId)
				if (index != -1) {
					this._myVo.occupyProductLineVos.splice(index, 1)
				}
			}
			if (this._allProductLineVoMap.has(data.productLineId)) {
				let vo = this._allProductLineVoMap.get(data.productLineId)
				vo.occupyPlayerBaseVo = data.record.attackerBaseVo
				vo.occupyFormationVisitVo = data.record.attackFormationVisitVo
				let visitInfo: Vo.factory.PlayerFactoryVisitVo = this.getVisitInfo(vo.belongPlayerBaseVo?.id)
				if (visitInfo) {
					visitInfo.productLineVo = vo
				}
			}
			this.emit(NotificationKey.FACTORY_PRODUCT_LINE_UPDATE, data.productLineId)
		}
	}

	/**
	 * 推送生产线被占领
	 * 模块号：49	指令号：-3
	 */
	public pushFactoryOwnerBeOccupy(): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.sendLoadFactoryInfo()
		this.emit(NotificationKey.FACTORY_OCCUPY_PUSH)
	}

	/**
	 * 推送占领被取消
	 * 模块号：49	指令号：-4
	 */
	public pushCancelBeOccupy(): void {
		//TODO 推送消息-在这里处理服务端返回的数据、
		this.sendLoadFactoryInfo()
		this.emit(NotificationKey.FACTORY_OCCUPY_PUSH)
	}

}
