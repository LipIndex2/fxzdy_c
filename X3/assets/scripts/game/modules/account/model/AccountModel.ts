import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { UIManager } from "../../../../core/mvc/UIManager";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import LoginModel from "../../../../main/modules/login/model/LoginModel";
import LoginNotificationKey from "../../../../main/modules/LoginNotificationKey";
import NotificationKey from "../../../event/NotificationKey";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { AccountI18nKeys } from "../const/AccountI18nKeys";
import { ReconnectMgr } from "../ReconnectMgr";

/**
 * 玩家角色模块指令定义
 * @author GameCreator
 */
export class AccountModel extends BaseModel {
	/**帐号vo */
	private _vo: Vo.account.AccountVo;

	/** 重连签名 */
	public reLoginSign: string;

	/**强制下线,禁止重连 */
	public forceOffline = false;

	/**是否在线 */
	public isOnline = false;

	/**所在服务器名字 (格式：S1.. 和外面客户端显示的可能不一样) */
	public inServerName: string;
	/**所在服务器Id */
	public serverId: string;

	/**
	 * 模块标识
	 */
	private MODULE = 12;

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
		// this.registerMsg(moduleId, 1, this.recCreate);
		// this.registerMsg(moduleId, 2, this.recLogin);
		this.registerMsg(moduleId, 3, this.recRelogin, true);
		// this.registerMsg(moduleId, 4, this.recCheckAccount);
		this.registerMsg(moduleId, 7, this.recLoginInfo);
		// this.registerMsg(moduleId, 9, this.recLoginComplete);
		// this.registerMsg(moduleId, 11, this.recGetTimeZone);
		// this.registerMsg(moduleId, 12, this.recLogout);
		this.registerMsg(moduleId, 13, this.recGetReLoginInfo);
		// this.registerMsg(moduleId, 14, this.recRestoreLogin);
		// this.registerMsg(moduleId, 15, this.recCreate2);
		// this.registerMsg(moduleId, 16, this.recCreate3);
		this.registerMsg(moduleId, -1, this.pushEnforceLogout);
		this.registerMsg(moduleId, -3, this.pushChangeState);
		this.registerMsg(moduleId, -4, this.pushKicked);
		this.registerMsg(moduleId, -5, this.pushKickedBecauseOnlineTimeMax);
		this.registerMsg(moduleId, -6, this.pushKickedBecauseForbidLoginTime);
		this.registerMsg(moduleId, -7, this.pushKickedBecauseNewVersion);

	}

	/**帐号vo */
	public get vo(): Vo.account.AccountVo {
		return this._vo;
	}

	/**初始化帐数据 */
	public initData(vo: Vo.account.AccountVo): void {
		this._vo = vo;
	}

	/*********************************协议发送*********************************/

	// /**
	//  * 创建账号与角色
	//  * 模块号：12	指令号：1
	//  */
	// public sendCreate(): void {
	// 	this.send(this.MODULE, 1);
	// }

	// /**
	//  * 账号登录
	//  * 模块号：12	指令号：2
	//  */
	// public sendLogin(): void {
	// 	let c2s = {} as Vo.account.LoginC2S;
	// 	this.send(this.MODULE, 2, c2s);
	// }

	/**
	 * 重连，断线重连第二阶段接口
	 * 模块号：12	指令号：3
	 */
	public sendRelogin(): void {
		let c2s = {} as Vo.account.ReloginC2S;

		c2s.account = LoginModel.ins().getAccount();
		c2s.age = 18;
		c2s.antiAddictionFlag = 0;//ChannelManager.ins().antiAddictionFlag; //1 防沉迷在线 2 防沉迷充值 3 全部
		c2s.key = this.reLoginSign;

		this.send(this.MODULE, 3, c2s);
	}

	// /**
	//  * 检查账号是否存在，此接口调用在获取协议前，应只传一个字符串，返回int
	//  * 模块号：12	指令号：4
	//  */
	// public sendCheckAccount(): void {
	// 	let c2s = {} as Vo.account.CheckAccountC2S;
	// 	this.send(this.MODULE, 4, c2s);
	// }

	/**
	 * 获取账号信息
	 * 模块号：12	指令号：7
	 */
	public sendLoginInfo(): void {
		this.send(this.MODULE, 7);
	}

	// /**
	//  * 登录完成
	//  * 模块号：12	指令号：9
	//  */
	// public sendLoginComplete(): void {
	// 	this.send(this.MODULE, 9);
	// }

	// /**
	//  * 获取时区
	//  * 模块号：12	指令号：11
	//  */
	// public sendGetTimeZone(): void {
	// 	this.send(this.MODULE, 11);
	// }

	/**
	 * 账号登出处理
	 * 模块号：12	指令号：12
	 */
	public sendLogout(): void {
		this.send(this.MODULE, 12);
	}

	/**
	 * 获取重新登录登录服信息
	 * 模块号：12	指令号：13
	 */
	public sendGetReLoginInfo(): void {
		this.send(this.MODULE, 13);
	}

	// /** (弃用)
	//  * 通过获取缺少消息来恢复登录，断线重连第一阶段接口
	//  * 模块号：12	指令号：14
	//  */
	// public sendRestoreLogin(): void {
	// 	let c2s = {} as Vo.account.RestoreLoginC2S;
	// 	this.send(this.MODULE, 14, c2s);
	// }

	// /**
	//  * 创建账号与角色
	//  * 模块号：12	指令号：15
	//  */
	// public sendCreate2(): void {
	// 	this.send(this.MODULE, 15);
	// }

	// /**
	//  * 创建账号与角色
	//  * 模块号：12	指令号：16
	//  */
	// public sendCreate3(): void {
	// 	let c2s = {} as Vo.account.Create3C2S;
	// 	this.send(this.MODULE, 16, c2s);
	// }

	/*********************************协议监听*********************************/

	// /**
	//  * 创建账号与角色
	//  * 模块号：12	指令号：1
	//  */
	// public recCreate(): void {
	// 	//TODO 在这里处理服务端返回的数据
	// }

	// /**
	//  * 账号登录
	//  * 模块号：12	指令号：2
	//  */
	// public recLogin(data: Vo.account.LoginS2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	// 	}
	// }

	/**
	 * 重连，断线重连第二阶段接口
	 * 模块号：12	指令号：3
	 */
	public recRelogin(data: Vo.account.ReloginS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this.sendLoginInfo();
		} else {
			ReconnectMgr.ins().networkError();
		}
	}

	// /**
	//  * 检查账号是否存在，此接口调用在获取协议前，应只传一个字符串，返回int
	//  * 模块号：12	指令号：4
	//  */
	// public recCheckAccount(data: Vo.account.CheckAccountS2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	// 	}
	// }

	/**
	 * 获取账号信息
	 * 模块号：12	指令号：7
	 */
	public recLoginInfo(data: Vo.account.LoginInfoS2C): void {
		if (data.code >= 0) {
			this.emit(LoginNotificationKey.INIT_PLAYER_INFO, data.content);
			this.emit(NotificationKey.RECONNECT_GAME_SERVER);
		} else {
			ReconnectMgr.ins().networkError();
		}
	}

	// /**
	//  * 登录完成
	//  * 模块号：12	指令号：9
	//  */
	// public recLoginComplete(data: Vo.account.LoginCompleteS2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	// 	}
	// }

	// /**
	//  * 获取时区
	//  * 模块号：12	指令号：11
	//  */
	// public recGetTimeZone(data: Vo.account.GetTimeZoneS2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	// 	}
	// }

	// /**
	//  * 账号登出处理
	//  * 模块号：12	指令号：12
	//  */
	// public recLogout(data: Vo.account.LogoutS2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	// 	}
	// }

	/**
	 * 获取重新登录登录服信息
	 * 模块号：12	指令号：13
	 */
	public recGetReLoginInfo(data: Vo.account.GetReLoginInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			//LoginModel.ins().quickReloadInfo = data.content; //获取快速登录数据
		}
	}

	// /**
	//  * 通过获取缺少消息来恢复登录，断线重连第一阶段接口
	//  * 模块号：12	指令号：14
	//  */
	// public recRestoreLogin(data: Vo.account.RestoreLoginS2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	// 	}
	// }

	// /**
	//  * 创建账号与角色
	//  * 模块号：12	指令号：15
	//  */
	// public recCreate2(): void {
	// 	//TODO 在这里处理服务端返回的数据
	// }

	// /**
	//  * 创建账号与角色
	//  * 模块号：12	指令号：16
	//  */
	// public recCreate3(data: Vo.account.Create3S2C): void {
	// 	if (data.code >= 0) {
	// 		//TODO 在这里处理服务端返回的数据
	//	 	}
	//}

	/*********************************协议推送*********************************/

	/**
	 * 用户强制退出(发生在同一个账号有重复登录时)
	 * 模块号：12	指令号：-1
	 */
	public pushEnforceLogout(): void {
		//TODO 推送消息-在这里处理服务端返回的数据

		this.forceOffline = true;

		G.UIManager.open(UICommonKey.BtnConfirmWarnView, {
			title: CommonI18nKeys.tipsForConfirm,
			content: AccountI18nKeys.forceLogoutContent,
			titleConfirm: AccountI18nKeys.backLoginBtn,
			onBtnYes: () => {
				G.reload();
			}
		} as BtnConfirmViewOpenArgs);
	}

	/**
	 * 推送状态变更事件
	 * 模块号：12	指令号：-3
	 */
	public pushChangeState(): void {
		//TODO 推送消息-在这里处理服务端返回的数据

		//暂无用途

	}

	/**
	 * 被管理后台踢线
	 * 模块号：12	指令号：-4
	 */
	public pushKicked(): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.forceOffline = true;

		G.UIManager.open(UICommonKey.BtnConfirmWarnView, {
			title: CommonI18nKeys.tipsForConfirm,
			content: AccountI18nKeys.kickedContent,
			titleConfirm: AccountI18nKeys.backLoginBtn,
			onBtnYes: () => {
				G.reload();
			}
		} as BtnConfirmViewOpenArgs);
	}

	/**
	 * 未成年人由于在线时间最大被踢线
	 * 模块号：12	指令号：-5
	 */
	public pushKickedBecauseOnlineTimeMax(): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.forceOffline = true;
		this.pushKicked();
	}

	/**
	 * 未成年人由于当前时段禁止登录被踢线
	 * 模块号：12	指令号：-6
	 */
	public pushKickedBecauseForbidLoginTime(): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.forceOffline = true;
		this.pushKicked();
	}

	/**
	 * 有新版本更新，请重新登录游戏！
	 * 模块号：12	指令号：-7
	 */
	public pushKickedBecauseNewVersion(): void {
		//TODO 推送消息-在这里处理服务端返回的数据

		this.forceOffline = true;
		G.UIManager.open(UICommonKey.BtnConfirmWarnView, {
			title: AccountI18nKeys.hotupdateTitle,
			content: AccountI18nKeys.hotupdateContent,
			titleConfirm: AccountI18nKeys.backLoginBtn,
			onBtnYes: () => {
				G.reload();
			}
		} as BtnConfirmViewOpenArgs);
	}

}
