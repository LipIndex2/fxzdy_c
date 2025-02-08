import { BaseModel } from "../../../core/mvc/model/BaseModel";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { PredictionController } from "./PredictionController";

/**
 * 功能预告模块
 * @author GameCreator
 */
export class PredictionModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 52;

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
        this.registerMsg(moduleId, 1, this.recGetPreviewInfo);
        this.registerMsg(moduleId, 2, this.recReceivePreviewReward);
    }

    public initData(vo: Vo.preview.PreviewVo): void {
        if (!vo) return;
        GIns.predictionMgr.receivedPreviewIds = vo.receivedPreviewIds;

        PredictionController.ins().checkRedDot();
    }
    /*********************************协议发送*********************************/

    /**
     * 获取预告信息
     * 模块号：52	指令号：1
     */
    public sendGetPreviewInfo(): void {
        this.send(this.MODULE, 1);
    }

    /**
     * 领取预告奖励
     * 模块号：52	指令号：2
     */
    public sendReceivePreviewReward(previewId: number): void {
        let c2s = {} as Vo.preview.ReceivePreviewRewardC2S;
        c2s.previewId = previewId;
        this.send(this.MODULE, 2, c2s, previewId);
    }

    /*********************************协议监听*********************************/

    /**
     * 获取预告信息
     * 模块号：52	指令号：1
     */
    public recGetPreviewInfo(data: Vo.preview.GetPreviewInfoS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 领取预告奖励
     * 模块号：52	指令号：2
     */
    public recReceivePreviewReward(data: Vo.preview.ReceivePreviewRewardS2C, previewId: number): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据

            GIns.predictionMgr.addReceivedPreviewIds(previewId);
            PredictionController.ins().checkRedDot();
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content);
            this.emit(NotificationKey.FUNCTION_NOTICE_UPDATE);
        }
    }

    /*********************************协议推送*********************************/
}
