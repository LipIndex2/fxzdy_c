import { TableConstUtils } from "db://assets/scripts/core/utils/TableConstUtils";
import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IStimulationCfg } from "./vo/IStimulationCfg";
import { IStimulationConstCfg } from "./vo/IStimulationConstCfg";
import { IStimulationData, IStimulationPosData } from "./vo/IStimulationData";
import { IStimulationLastData } from "./vo/IStimulationLastData";
import { IStimulationLvCfg } from "./vo/IStimulationLvCfg";
import { IStimulationRewards } from "./vo/IStimulationRewards";
import { DEBUG } from "cc/env";

export interface IStimulationCapacityUpdateListener {
	target: object;
	callback: () => void;
}


/**
 * 模拟经营模块
* @author GameCreator
 */
export class StimulationModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 51;

	/**常量配置*/
	protected _constCfg: IStimulationConstCfg = null;
	/**配置数据*/
	protected _cfgMap: Map<number, IStimulationCfg> = new Map();
	/**以建筑id为key的配置数据*/
	protected _cfgForBuildingMap: Map<number, IStimulationCfg> = new Map();
	/**以道具id为key的配置数据*/
	protected _cfgForItemMap: Map<number, IStimulationCfg> = new Map();
	/**设备数据*/
	protected _deviceMap: Map<number, IStimulationData> = new Map();
	/**设备等级配置*/
	protected _deviceLvCfgMap: Map<number, IStimulationLvCfg> = new Map();
	/**回收配置*/
	protected _recycleCfgMap: Map<number, table.stimulation.StimulationRecycleConfig> = new Map();
	/**奖励领取请求间隔*/
	protected _requestDrawInterval: number = 2000;
	/**上次奖励领取请求时间*/
	protected _lastRequestDrawTime: number = 0;
	/**检测更新数量*/
	protected _deviceCapacityUpdateEvents: Map<number, IStimulationCapacityUpdateListener[]> = new Map();

	protected _lastDeviceMap: Map<number, IStimulationLastData> = new Map();

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
		this.registerMsg(moduleId, 1, this.recLoadDeviceList);
		this.registerMsg(moduleId, 2, this.recActivate);
		this.registerMsg(moduleId, 3, this.recUpLevel);
		this.registerMsg(moduleId, 4, this.recDispatch);
		this.registerMsg(moduleId, 5, this.recDrawDeviceRewards);
		this.registerMsg(moduleId, 6, this.recRecycle);
		this.registerMsg(moduleId, 7, this.recSkipUpLevelWait);
		this.registerMsg(moduleId, 8, this.recAdShortenUpLevelWait);
		this.registerMsg(moduleId, -1, this.pushDeviceInfo);

	}

	/**初始化数据 */
	public initData(data: Vo.stimulation.StimulationDeviceVo[]): void {
		if (this._cfgMap.size <= 0) {
			this._constCfg = {
				upLevelAdDeductMinutes: TableConstUtils.getConstConfigToNumber(table.stimulation.StimulationConstantConfig, 'STIMULATION:UP_LEVEL_AD_DEDUCT_MINUTES'),
			}
			let allCfgs = G.TableManager.getAllData(table.stimulation.StimulationDeviceConfig);
			allCfgs.forEach((cfg) => {
				let buildingCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, cfg.buildingId);
				let cfgData: IStimulationCfg = {
					cfg: cfg,
					buildingCfg: buildingCfg
				}
				this._cfgMap.set(cfg.id, cfgData);
				this._cfgForBuildingMap.set(cfg.buildingId, cfgData);
				this._cfgForItemMap.set(cfg.itemId, cfgData);
				let deviceData: IStimulationData = {
					cfg: cfgData,
					vo: null,
					timerKey: null,
					posMap: new Map()
				}
				this._deviceMap.set(cfg.id, deviceData);
				this._lastDeviceMap.set(cfg.id, {
					deviceId: cfg.id,
					lv: 0,
					speed: 0,
					capacity: 0,
				});
			})

			let allLvCfgs = G.TableManager.getAllData(table.stimulation.StimulationDeviceLevelConfig);
			allLvCfgs?.forEach((cfg) => {
				let key = this.getLvCfgKey(cfg.deviceId, cfg.level);
				let data: IStimulationLvCfg = null;
				if (this._deviceLvCfgMap.has(cfg.deviceId)) {
					data = this._deviceLvCfgMap.get(cfg.deviceId);
				} else {
					data = {
						cfMap: new Map(),
						posUnlockLvMap: new Map(),
						maxPosCnt: 0
					};
					this._deviceLvCfgMap.set(cfg.deviceId, data);
				}
				data.cfMap.set(key, cfg);
				let lv = -1;
				let posId: number = cfg.dispatchNum - 1;
				if (data.posUnlockLvMap.has(posId)) {
					lv = data.posUnlockLvMap.get(posId);
				}
				if (cfg.level < lv || lv == -1) {
					data.posUnlockLvMap.set(posId, cfg.level);
					if (data.maxPosCnt < cfg.dispatchNum) {
						data.maxPosCnt = cfg.dispatchNum;
					}
				}
			})

			let allRecycleCfgs = G.TableManager.getAllData(table.stimulation.StimulationRecycleConfig);
			allRecycleCfgs?.forEach((cfg) => {
				this._recycleCfgMap.set(cfg.costs[0].k, cfg);
			})
		}

		//初始化设备信息
		this._deviceMap.forEach((value) => {
			let vo = data.find(v => v.id == value.cfg.cfg.id);
			value.vo = vo ? vo : null;
			this.checkNextUpdateTime(value, true);
			this.updatePosData(value);
		});
		this._lastDeviceMap.forEach((value) => {
			value.lv = 0;
			value.speed = 0;
			value.capacity = 0;
		});
	}

	/*********************************数据处理*********************************/

	/**常量配置*/
	public get constCfg(): IStimulationConstCfg {
		return this._constCfg;
	}

	/**获取所有设备map*/
	public get deviceMap(): Map<number, IStimulationData> {
		return this._deviceMap;
	}

	/**获取当前旧数据 UI使用*/
	public getLastData(deviceId: number): IStimulationLastData {
		return this._lastDeviceMap.get(deviceId);
	}

	/**同步数据到旧数据 UI使用*/
	public syncDataToLast(data: IStimulationData, speed: number): void {
		let lastData = this.getLastData(data.cfg.cfg.id);
		if (lastData) {
			lastData.lv = data.vo.level;
			lastData.speed = speed;
			lastData.capacity = data.vo.capacity;
		}
	}

	/**获取配置信息*/
	public getCfg(deviceId: number): IStimulationCfg {
		return this._cfgMap.get(deviceId)
	}

	/**根据建筑获取配置*/
	public getCfgByBuilding(buildingId: number): IStimulationCfg {
		return this._cfgForBuildingMap.get(buildingId)
	}

	/**根据道具获取配置*/
	public getCfgByItem(itemId: number): IStimulationCfg {
		return this._cfgForItemMap.get(itemId)
	}

	/**获取设备信息*/
	public getDeviceData(deviceId: number): IStimulationData {
		return this._deviceMap.get(deviceId)
	}

	/**根据建筑获取设备信息*/
	public getDeviceDataByBuilding(buildingId: number): IStimulationData {
		let cfg = this.getCfgByBuilding(buildingId)
		if (cfg) {
			return this.getDeviceData(cfg.cfg.id)
		}
		return null
	}

	/**根据道具获取设备信息*/
	public getDeviceDataByItem(itemId: number): IStimulationData {
		let cfg = this.getCfgByItem(itemId)
		if (cfg) {
			return this.getDeviceData(cfg.cfg.id)
		}
		return null
	}

	/**获取等级配置*/
	public getLvCfg(id: number, lv: number): table.stimulation.StimulationDeviceLevelConfig {
		if (this._deviceLvCfgMap.has(id)) {
			let map = this._deviceLvCfgMap.get(id).cfMap;
			let key = this.getLvCfgKey(id, lv);
			if (map.has(key)) {
				return map.get(key);
			}
		}
		return null;
	}

	/**获取最大加成位置数量*/
	public getMaxPosCnt(id: number): number {
		if (this._deviceLvCfgMap.has(id)) {
			return this._deviceLvCfgMap.get(id).maxPosCnt;
		}
		return 0;
	}

	/**获取位置解锁等级需求*/
	public getPosUnlockLv(id: number, pos: number): number {
		if (this._deviceLvCfgMap.has(id)) {
			let map = this._deviceLvCfgMap.get(id).posUnlockLvMap;
			if (map.has(pos)) {
				return map.get(pos);
			}
		}
		return 0;
	}

	/**获取回收配置*/
	public getRecycleCfg(itemId: number): table.stimulation.StimulationRecycleConfig {
		return this._recycleCfgMap.get(itemId);
	}

	/**获取等级配置key值*/
	protected getLvCfgKey(id: number, lv: number): string {
		return id + '_' + lv;
	}

	protected refreshNextUpdateTime(data: IStimulationData): void {
		if (this._deviceCapacityUpdateEvents.has(data.cfg.cfg.id)) {
			this.checkNextUpdateTime(data);
		}
	}

	/**检测下次更新时间*/
	public checkNextUpdateTime(data: IStimulationData, isInit: boolean = false): void {
		if (data.vo == null) {
			if (data.timerKey) {
				G.GameTimer.clearByKey(data.timerKey)
				data.timerKey = null
			}
			return
		}
		if (data.timerKey) {
			G.GameTimer.clearByKey(data.timerKey)
			data.timerKey = null
		}
		if (data.vo.storeNum < data.vo.capacity) {
			//储量未满时需要计时更新数据
			let nowTime: number = G.TimeManager.serverNow;
			let offsetTime: number = nowTime - data.vo.startTime;
			//每生产一个的时间
			let preCountTime: number = data.vo.intervalMillis;
			if (offsetTime >= preCountTime) {
				//代表已经足够生成一个了
				let addNum: number = Math.floor(offsetTime / preCountTime);
				data.vo.storeNum += addNum;
				let addTime: number = addNum * preCountTime;
				offsetTime -= addTime
				data.vo.startTime += addTime;
				this.onDeviceCapacityChange(data);
			}
			if (data.vo.storeNum >= data.vo.capacity) {
				data.vo.storeNum = data.vo.capacity;
			} else {
				if (isInit == false) {
					let nextUpdateTime: number = preCountTime - offsetTime;
					data.timerKey = G.GameTimer.once(nextUpdateTime, this, () => {
						data.vo.storeNum += 1;
						data.vo.startTime += preCountTime;
						this.onDeviceCapacityChange(data);
						this.refreshNextUpdateTime(data);
					});
				}
			}
		}
	}

	protected onDeviceCapacityChange(data: IStimulationData): void {
		if (this._deviceCapacityUpdateEvents.has(data.cfg.cfg.id)) {
			let arr: IStimulationCapacityUpdateListener[] = this._deviceCapacityUpdateEvents.get(data.cfg.cfg.id);
			arr.forEach((value) => {
				value.callback.apply(value.target);
			});
		}
	}

	/**打印日志*/
	protected logCheckNextUpdateTime(): void {
		// if (DEBUG) {
		// 	console.log('checkNextUpdateTimeCnt total ', this._deviceCapacityUpdateEvents.size);
		// 	this._deviceCapacityUpdateEvents.forEach((listeners, id) => {
		// 		console.log('checkNextUpdateTimeCnt ', id, listeners.length);
		// 	})
		// }
	}


	/**添加储量变化监听*/
	public addCapacityUpdateListener(data: IStimulationData, callback: () => void, target: object): void {
		let arr: IStimulationCapacityUpdateListener[] = null;
		if (this._deviceCapacityUpdateEvents.has(data.cfg.cfg.id)) {
			//已存在
			arr = this._deviceCapacityUpdateEvents.get(data.cfg.cfg.id);
		} else {
			arr = [];
			this._deviceCapacityUpdateEvents.set(data.cfg.cfg.id, arr);
		}
		let index = arr.findIndex((value) => value.target == target && value.callback == callback);
		if (index != -1) {
			//回调已存在就不继续添加了
			return;
		}
		arr.push({ target: target, callback: callback });
		if (arr.length == 1) {
			this.checkNextUpdateTime(data);
		}
		this.logCheckNextUpdateTime();
	}

	/**移除储量变化监听*/
	public removeCapacityUpdateListener(data: IStimulationData, callback: () => void, target: object): void {
		if (this._deviceCapacityUpdateEvents.has(data.cfg.cfg.id)) {
			let arr: IStimulationCapacityUpdateListener[] = this._deviceCapacityUpdateEvents.get(data.cfg.cfg.id);
			let index = arr.findIndex((value) => value.target == target && value.callback == callback);
			if (index != -1) {
				arr.splice(index, 1);
				if (arr.length <= 0) {
					//代表一个回调监听都没 直接移除
					this._deviceCapacityUpdateEvents.delete(data.cfg.cfg.id);
				}
			}
			this.logCheckNextUpdateTime();
		}
	}

	/**更新位置信息*/
	protected updatePosData(data: IStimulationData): void {
		let posCnt: number = this.getMaxPosCnt(data.cfg.cfg.id);
		for (let i = 0; i < posCnt; i++) {
			let posId: number = i;
			let posData: IStimulationPosData = null
			if (data.posMap.has(posId)) {
				posData = data.posMap.get(posId)
			} else {
				posData = {
					id: posId,
					isUnlock: false,
					needLv: this.getPosUnlockLv(data.cfg.cfg.id, posId)
				}
				data.posMap.set(posId, posData);
			}
			posData.isUnlock = data.vo && posData.needLv <= data.vo.level
		}
	}

	/*********************************协议发送*********************************/

	/**
	 * 获取设备信息列表
	 * 模块号：51	指令号：1
	 */
	public sendLoadDeviceList(): void {
		this.send(this.MODULE, 1);
	}

	/**
	 * 解锁
	 * 模块号：51	指令号：2
	 */
	public sendActivate(c2s: Vo.stimulation.ActivateC2S): void {
		this.send(this.MODULE, 2, c2s);
	}

	/**
	 * 升级
	 * 模块号：51	指令号：3
	 */
	public sendUpLevel(c2s: Vo.stimulation.UpLevelC2S): void {
		this.send(this.MODULE, 3, c2s);
	}

	/**
	 * 派遣
	 * 模块号：51	指令号：4
	 */
	public sendDispatch(c2s: Vo.stimulation.DispatchC2S): void {
		this.send(this.MODULE, 4, c2s);
	}

	/**
	 * 领取设备奖励
	 * 模块号：51	指令号：5
	 */
	public sendDrawDeviceRewards(c2s: Vo.stimulation.DrawDeviceRewardsC2S): void {
		let nowTime = G.TimeManager.serverNow;
		if (nowTime - this._lastRequestDrawTime >= this._requestDrawInterval) {
			this._lastRequestDrawTime = nowTime;
			this.send(this.MODULE, 5, c2s);
		}
	}

	/**
	 * 回收
	 * 模块号：51	指令号：6
	 */
	public sendRecycle(c2s: Vo.stimulation.RecycleC2S): void {
		this.send(this.MODULE, 6, c2s);
	}

	/**
	 * 跳过设备升级等待
	 * 模块号：51	指令号：7
	 */
	public sendSkipUpLevelWait(c2s: Vo.stimulation.SkipUpLevelWaitC2S): void {
		this.send(this.MODULE, 7, c2s);
	}

	/**
	 * 观看广告缩短设备升级等待时间
	 * 模块号：51	指令号：8
	 */
	public sendAdShortenUpLevelWait(c2s: Vo.stimulation.AdShortenUpLevelWaitC2S): void {
		this.send(this.MODULE, 8, c2s, c2s);
	}

	/*********************************协议监听*********************************/

	/**
	 * 获取设备信息列表
	 * 模块号：51	指令号：1
	 */
	public recLoadDeviceList(data: Vo.stimulation.LoadDeviceListS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			//初始化设备信息
			this._deviceMap.forEach((value) => {
				let vo = data.content?.find(v => v.id == value.cfg.cfg.id);
				value.vo = vo ? vo : null;
				this.refreshNextUpdateTime(value);
			})
			this.emit(NotificationKey.STIMULATION_DEVICE_UPDATE, 0);
		}
	}

	/**
	 * 解锁
	 * 模块号：51	指令号：2
	 */
	public recActivate(data: Vo.stimulation.ActivateS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			if (data.content?.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
			}

			let deviceData = this._deviceMap.get(data.content.deviceVo.id);
			if (deviceData) {
				deviceData.vo = data.content.deviceVo;
				this.refreshNextUpdateTime(deviceData);
				this.updatePosData(deviceData);
				this.emit(NotificationKey.STIMULATION_DEVICE_UPDATE, data.content.deviceVo.id);
			}
		}
	}

	/**
	 * 升级
	 * 模块号：51	指令号：3
	 */
	public recUpLevel(data: Vo.stimulation.UpLevelS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			if (data.content?.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
			}

			let deviceData = this._deviceMap.get(data.content.deviceVo.id);
			if (deviceData) {
				deviceData.vo = data.content.deviceVo;
				this.refreshNextUpdateTime(deviceData);
				this.updatePosData(deviceData);
				this.emit(NotificationKey.STIMULATION_DEVICE_UPDATE, data.content.deviceVo.id);
				GIns.floatingTextMgr.showTips(`设备开始升级`);
			}
		}
	}

	/**
	 * 派遣
	 * 模块号：51	指令号：4
	 */
	public recDispatch(data: Vo.stimulation.DispatchS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			let deviceData = this._deviceMap.get(data.content.id);
			if (deviceData) {
				deviceData.vo = data.content;
				this.refreshNextUpdateTime(deviceData);
				this.emit(NotificationKey.STIMULATION_DEVICE_UPDATE, data.content.id);
				this.emit(NotificationKey.STIMULATION_DISPATCH_COMPLETE, data.content.id);
			}
		}
	}

	/**
	 * 领取设备奖励
	 * 模块号：51	指令号：5
	 */
	public recDrawDeviceRewards(data: Vo.stimulation.DrawDeviceRewardsS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			if (data.content?.rewardResults?.length > 0) {
				let rewardData: IStimulationRewards = {
					deviceId: data.content.deviceVo.id,
					rewards: data.content.rewardResults
				}
				this.emit(NotificationKey.STIMULATION_DRAW_REWARD_COMPLETE, rewardData);

				//延迟刷新奖励数据给动画初始化一点时间
				G.GameTimer.once(50, this, () => {
					this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.content.rewardResults);
				})
			}
			//先派发奖励再处理数据 防止直接刷新了UI 动画对不上
			let deviceData = this._deviceMap.get(data.content.deviceVo.id);
			if (deviceData) {
				deviceData.vo = data.content.deviceVo;
				this.refreshNextUpdateTime(deviceData);
				this.emit(NotificationKey.STIMULATION_DEVICE_UPDATE, data.content.deviceVo.id);
			}

		}
	}

	/**
	 * 回收
	 * 模块号：51	指令号：6
	 */
	public recRecycle(data: Vo.stimulation.RecycleS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			if (data.content.costs?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costs);
			}
			if (data.content?.rewards?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewards);
			}
			this.emit(NotificationKey.STIMULATION_RECYCLE_COMPLETE);
		}
	}

	/**
	 * 跳过设备升级等待
	 * 模块号：51	指令号：7
	 */
	public recSkipUpLevelWait(data: Vo.stimulation.SkipUpLevelWaitS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			//只处理消耗 设备刷新在推送那里
			if (data.content?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content);
			}
		}
	}

	/**
	 * 观看广告缩短设备升级等待时间
	 * 模块号：51	指令号：8
	 */
	public recAdShortenUpLevelWait(data: Vo.stimulation.AdShortenUpLevelWaitS2C, c2s: Vo.stimulation.AdShortenUpLevelWaitC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			let deviceData = this._deviceMap.get(c2s.deviceId);
			/**如果当前设备还是处于升级中就需要处理加速数据
			 * 否则就代表后端已经推送了最新的设备数据 这里就不能处理防止覆盖后端新数据
			*/
			if (deviceData && deviceData.vo.nextLevel > 0) {
				deviceData.vo.nextLevelTime -= this._constCfg.upLevelAdDeductMinutes * 60000;
				deviceData.vo.nextLevelAdTimes++;
				this.emit(NotificationKey.STIMULATION_DEVICE_UPDATE, deviceData.cfg.cfg.id);
			}
			GIns.floatingTextMgr.showTips(`成功加速${this._constCfg.upLevelAdDeductMinutes}分钟升级时间`);
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送设备信息，StimulationDeviceVo
	 * 模块号：51	指令号：-1
	 */
	public pushDeviceInfo(data: Vo.stimulation.StimulationDeviceVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		let deviceData = this._deviceMap.get(data.id);
		if (deviceData) {
			deviceData.vo = data;
			this.refreshNextUpdateTime(deviceData);
			this.updatePosData(deviceData);
			this.emit(NotificationKey.STIMULATION_DEVICE_UPDATE, data.id);
		}
	}

}
