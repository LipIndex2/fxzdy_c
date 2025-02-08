import { Game } from "cc";
import G from "../../../core/comm/G";
import { LayaEvent } from "../../../core/comm/LayaEvent";
import { BaseNotification } from "../../../core/mvc/BaseNotification";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ConnectState, SocketManager } from "../../../core/net/SocketManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import { BtnConfirmViewOpenArgs } from "../common/confirm/BtnConfirmView";
import { UICommonKey } from "../common/const/UICommonConfig";
import { CommonI18nKeys } from "../common/i18n/CommonI18nKeys";
import { SystemModel } from "../system/model/SystemModule";
import { AccountI18nKeys } from "./const/AccountI18nKeys";
import { AccountModel } from "./model/AccountModel";
import { game } from "cc";
import { UIManager } from "../../../core/mvc/UIManager";
import { UIAccountConfig } from "./const/UIAccountConfig";


/**
 * 游戏中的重连管理
 */
export class ReconnectMgr extends BaseController {

	private MAX_RECONNECT_TIMES = 10;

	/**重连次数 */
	private _reConnectNum: number = 0;

	public init() {
		SocketManager.ins().on(LayaEvent.OPEN, this.onSuccessConnect, this);
		//SocketManager.ins().on(LayaEvent.ERROR, this.onFailConnect, this);
		SocketManager.ins().on(LayaEvent.CLOSE, this.onCloseConnect, this);

		game.on(Game.EVENT_SHOW, this.onStageFocus.bind(this));
		game.on(Game.EVENT_HIDE, this.onStageBlur.bind(this));

	}

	/**连接成功 */
	private onSuccessConnect(): void {
		this._reConnectNum = 0;
		this.cleanTimer();
		AccountModel.ins().sendRelogin(); //重登
	}

	/**连接失败 */
	// private onFailConnect(): void {
	// 	this.onCloseConnect();
	// }

	/**断开连接 */
	private onCloseConnect(): void {
		console.log("断开连接");
		AccountModel.ins().isOnline = false;
		if (AccountModel.ins().forceOffline) return;
		GameTimer.ins().callLater(this, this.checkReconnectCondition);
	}

	/**检查重连条件 */
	private checkReconnectCondition() {
		console.log("checkReconnect");
		if (!AccountModel.ins().reLoginSign) {
			this.networkError();
		} else {
			this.doReConnect();
		}
	}

	/**失去焦点 */
	private onStageBlur(): void {
	}

	/**获得焦点 */
	private onStageFocus(): void {
		if (AccountModel.ins().forceOffline) return;

		if (SocketManager.ins().state === ConnectState.Unconnect) {
			this.doReConnect();
		} else {
			this.checkNetwork();
		}
	}

	/**检查网络连接状态 */
	private checkNetwork() {
		//console.log(">>>>>>>>>>>>>>>>>>>>>> checkNetwork <<<<<<<<<<<<<<<<<<<<<<<<<  " + SocketManager.ins().state);
		if (!AccountModel.ins().vo) return; //不在游戏中

		let reposeNum = SocketManager.ins().reposeNum;
		SystemModel.ins().sendSystemTime();//心跳
		GameTimer.ins().once(3000, this, this.checkHeartBreath, [reposeNum], true);
	}

	/**心跳检测 */
	private checkHeartBreath(reposeNum) {
		if (reposeNum == SocketManager.ins().reposeNum) {
			//console.log("!!!!!!!!! 未收到心跳包，网络异常 !!!!!!!!!!!!!!!");
			if (SocketManager.ins().state === ConnectState.Connected) {
				//console.log("!!!!!!!!! 网络状态连接中，将主动断开后重连 !!!!!!!!!!!!!!!");
				//主动断开服务器
				SocketManager.ins().closeConnect();
			}
			this.onCloseConnect();
		} else {
			console.log("网络正常");
		}
	}

	private doReConnect() {
		if (!GameTimer.ins().hasTimer(this, this.onReConnect)) {
			//未有循环
			this.onReConnect();
		}
	}

	/**重连*/
	private onReConnect(): void {
		if (SocketManager.ins().state === ConnectState.Connected) {
			//连接成功
			GameTimer.ins().clear(this, this.onReConnect);
			return;
		}

		if (this._reConnectNum++ > this.MAX_RECONNECT_TIMES) {
			//连接超时
			this.networkError(true);
			return;
		}

		this.showLoading();
		SocketManager.ins().reconnect(); //重连
		GameTimer.ins().once(1000, this, this.onReConnect);
	}

	/**重连失败
	 * @params retry 重新连接
	 */
	public networkError(retry: boolean = false) {
		this._reConnectNum = this.MAX_RECONNECT_TIMES; //防止关闭socket 触发重连
		SocketManager.ins().closeConnect();
		this.cleanTimer();

		AccountModel.ins().forceOffline = true; //强制下线 

		G.UIManager.open(UICommonKey.BtnConfirmWarnView, {
			title: AccountI18nKeys.reconnectTitle,
			content: AccountI18nKeys.reconnectContent,
			titleConfirm: AccountI18nKeys.backLoginBtn,
			onBtnYes: () => {
				G.reload();
			}
		} as BtnConfirmViewOpenArgs);
	}

	/**重连中 */
	private showLoading() {
		if (!UIManager.ins().isOpened(UIAccountConfig.ReconnectWin)) {
			UIManager.ins().open(UIAccountConfig.ReconnectWin);
		}
	}

	private cleanTimer() {
		GameTimer.ins().clear(this, this.checkHeartBreath); //连接成功 清理心跳检查
		GameTimer.ins().clear(this, this.onReConnect); //连接成功 清理重连
		UIManager.ins().close(UIAccountConfig.ReconnectWin);
	}
}
