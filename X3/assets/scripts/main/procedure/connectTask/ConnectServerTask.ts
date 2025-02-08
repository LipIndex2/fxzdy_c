import { off } from "puerts";
import { LayaEvent } from "../../../core/comm/LayaEvent";
import { SocketManager } from "../../../core/net/SocketManager";
import { Task } from "../../../core/task/TaskManager";
import { ChooseServerModel } from "../../modules/login/model/ChooseServerModel";
import G from "../../../core/comm/G";
import LoginNotificationKey from "../../modules/LoginNotificationKey";

/**
 * 连接服务器
 **/
export class ConnectServerTask extends Task {
    private _args: any
    public run(args?: any): void {
        this._args = args;

        var serverVo = ChooseServerModel.ins().serverVo;
        if (!serverVo) {
            // console.error();
            // throw new Error("无服务器数据");
            // G.FacadeManager.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "");
            return;
        }

        G.GameTimer.once(3000, this, this.onTimeOut);

        SocketManager.ins().on(LayaEvent.OPEN, this.onSuccessConnect, this);
        SocketManager.ins().on(LayaEvent.ERROR, this.onFailConnect, this);
        SocketManager.ins().on(LayaEvent.CLOSE, this.onCloseConnect, this);

        var address = serverVo.address;

        // var tl = address.split(":");
        // console.log("连接服务器:" + address);
        SocketManager.ins().connect(address);


    }

    /**连接成功 */
    private onSuccessConnect(): void {
        this.offEvent();
        this.end();
    }

    /**连接失败 */
    private onFailConnect(e): void {
        this.onFail();
    }


    /**连接关闭 */
    private onCloseConnect(e): void {
        this.onFail();
    }

    private onFail() {
        G.FacadeManager.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "服务器连接失败");

        this.offEvent();
        SocketManager.ins().clear();
        this.exit();
    }


    private offEvent() {
        G.GameTimer.clearAll(this);
        SocketManager.ins().off(LayaEvent.OPEN, this.onSuccessConnect, this);
        SocketManager.ins().off(LayaEvent.ERROR, this.onFailConnect, this);
        SocketManager.ins().off(LayaEvent.CLOSE, this.onCloseConnect, this);
    }

    private onTimeOut() {
        SocketManager.ins().closeConnect();
        this.onFail();
    }

}
