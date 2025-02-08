import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";


export class AdData {
	/**配置数据*/
	cfg:table.advertising.AdvertisingConfig
}
/**
 * 广告模块
 * @author GameCreator
 */
export class AdModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 0;

	protected _adDataMap:Map<string, AdData> = new Map()
	/**是否展示购买提示*/
	public isShowTip:boolean = true

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
	}

	/**初始化数据 */
	public initData(): void {
		if (this._adDataMap.size <= 0) {
			let allCfgs = G.TableManager.getAllData(table.advertising.AdvertisingConfig)
			allCfgs.forEach((cfg) => {
				let key = this.getAdKey(cfg.type, cfg.param)
				let data = new AdData()
				data.cfg = cfg
				this._adDataMap.set(key, data)
			})
		}
	}

	/*********************************数据处理*********************************/

	/**获取广告存储键值*/
	protected getAdKey(type:string, param:string):string {
		if (!param) {
			return type
		}
		return type + '_' + param
	}

	public getAdData(type:ServerEnums.AdvertType, param:string = ''):AdData {
		let typeStr:string = ServerEnums.AdvertType[type]
		let key = this.getAdKey(typeStr, param)
		if (this._adDataMap.get(key)) {
			return this._adDataMap.get(key)
		}
		return null
	}

	/**获取总共广告次数*/
	public getTotalAdTimes(type:ServerEnums.AdvertType, param:string = ''):number {
		let adData:AdData = this.getAdData(type, param)
		if (adData) {
			return adData.cfg.advertTimes
		}
		return 0
	}

	/**剩余广告次数*/
	public getRemainAdTimes(useTimes:number, type:ServerEnums.AdvertType, param:string = ''):number {
		let adData:AdData = this.getAdData(type, param)
		if (adData) {
			return Math.max(0, adData.cfg.advertTimes - useTimes)
		}
		return 0
	}

	/*********************************协议发送*********************************/


	/*********************************协议推送*********************************/
}
