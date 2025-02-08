import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ConnectState, SocketManager } from "../../../../core/net/SocketManager";
import { TimeManager } from "../../../../core/time/TimeManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 系统服务模块指令定义
 * @author GameCreator
 */
export class SystemModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 0;

	/**下次刷新时间 */
	private _nextRefreshTime = 0;

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
		//this.registerMsg(moduleId, 1, this.recRequestDescription);
		this.registerMsg(moduleId, 2, this.recSystemTime);
		this.registerMsg(moduleId, 3, this.recMd5Description);
		this.registerMsg(moduleId, -1, this.pushOpenServer);

	}

	initData() {
		GameTimer.ins().loop(20000, this, this.requestTime);
		this.checkNextDay();
	}

	private checkNextDay() {
		this._nextRefreshTime = TimeManager.systemRefreshTime;
		GameTimer.ins().once(this._nextRefreshTime - TimeManager.serverNow, this, this.sendSystemTime);
	}


	/**启动循环更新时间 20秒一次 心跳 */
	private requestTime(): void {
		if (SocketManager.ins().state === ConnectState.Connected) {
			this.sendSystemTime();
		}
	}

	/*********************************协议发送*********************************/

	/**
	 * 获取传输对象定义, 只能管理后台调用
	 * 模块号：0	指令号：1
	 */
	// public sendRequestDescription(): void {
	// 	this.send(this.MODULE, 1);
	// }

	/**
	 * 获取当前的系统时间
	 * 模块号：0	指令号：2
	 */
	public sendSystemTime(): void {
		this.send(this.MODULE, 2);
	}

	/**
	 * 获取传输对象定义MD5串, 用于验证客户端本地存储的传输对象定义是否有效
	 * 模块号：0	指令号：3
	 */
	public sendMd5Description(): void {
		this.send(this.MODULE, 3);
	}

	/*********************************协议监听*********************************/

	/**
	 * 获取传输对象定义, 只能管理后台调用
	 * 模块号：0	指令号：1
	 */
	// public recRequestDescription(data: Vo.system.RequestDescriptionS2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	// 	}
	// }

	/**
	 * 获取当前的系统时间
	 * 模块号：0	指令号：2
	 */
	public recSystemTime(data: Vo.system.SystemTimeS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content) {
				TimeManager.setCurServerTime(data.content);
				if (this._nextRefreshTime <= TimeManager.serverNow) {
					this.emit(NotificationKey.SYSTEM_NEW_DAY);
					this.checkNextDay();
				}
				this.emit(NotificationKey.SYSTEM_TIME_UPDATE)
			}
		}
	}

	/**
	 * 获取传输对象定义MD5串, 用于验证客户端本地存储的传输对象定义是否有效
	 * 模块号：0	指令号：3
	 */
	public recMd5Description(data: Vo.system.Md5DescriptionS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 开服事件推送
	 * 模块号：0	指令号：-1
	 */
	public pushOpenServer(): void {
		//TODO 推送消息-在这里处理服务端返回的数据
	}

}
