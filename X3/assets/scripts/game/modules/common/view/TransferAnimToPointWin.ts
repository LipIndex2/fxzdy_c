import { UIWin } from "../../../../core/mvc/view/UIWin";
import { IAnimOrder, ModelNode } from "../node/ModelNode";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { BattleExpandManager } from "../../../comm/battleEx/BattleExpandManager";
import NotificationKey from "../../../event/NotificationKey";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ITransfer } from "../../../tiledMap/interface/ITransfer";
import { MapManager } from "../../../tiledMap/MapManager";
import { TableManager } from "../../../../core/table/TableManager";
import { Vec3 } from "cc";
import { UIMain18nKeys } from "../../../ui/main/const/UIMain18nKeys";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommonKey } from "../const/UICommonConfig";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import GIns from "../../../GIns";

declare global {
    namespace NCommon {
        interface ITransferAnimToPointWin_param { 
            mapId?: number,  //传送终点地图id
            transferData?: ITransfer,   //传送数据，如果有传 transferData 的话就会忽略 mapId
            pos?: { x: number, y: number } //同地图传送的情况下，传送终点位置
        }
    }
}


/** 跨地图传送效果，传mapId */
export class TransferAnimToPointWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "TransferAnimWin";
    public _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;


    private _isSameMap: boolean;

    private _mapId: number;
    private _transferData: ITransfer;

    private _pos: { x: number, y: number };

    private get view(): ui.comm.view.TransferAnimWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.LOADING_VIEW_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_AREA_TRANSFER_END:
                //同地图没有loading
                if (this._isSameMap) {
                    //GIns.battleMgr.stopFightAi();
                    this.playEndAnim1();
                }
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                BattleExpandManager.ins().hideHeroes();
                GIns.battleMgr.stopFightAi(); //切换地图需要重新停止ai
                break;
            case NotificationKey.LOADING_VIEW_COMPLETE:
                this.playEndAnim1();
                break;
        }
    }

    public onInit(): void {
        GIns.battleMgr.endFight();
    }

    public onOpen(args: NCommon.ITransferAnimToPointWin_param): void {
        this._pos = args.pos;
        this._mapId = args.mapId;
        this._transferData = args.transferData
        this._isSameMap = args.mapId === MapManager.ins().getMapID();

        this.emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING);

        this.doAnim();
    }

    public onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    private doAnim() {
        GIns.cameraAnimUtils.zoomOutByTransfer()
        GameTimer.ins().once(800, this, this.playStartAnim1);
    }

    /******************************** 传送开始 **********************************/
    private playStartAnim1() {
        BattleExpandManager.ins().transferStartAnimFadeOut();
        GameTimer.ins().once(1100, this, this.playStartAnim2);
    }

    private playStartAnim2() {
        // 传送阵 id
        if (this._isSameMap) {
            let transferPos = new Vec3();
            transferPos.set(-this._pos.x, -this._pos.y);
            GIns.cameraAnimUtils.moveMapByTargetPos(transferPos); //移动地图
            GameTimer.ins().once(1000, this, this.transfear);
        } else {
            this.transfear();
            this.emit(NotificationKey.LOADING_VIEW_SHOW); //加载中
        }
    }

    private transfear() {
        let transfarData: ITransfer
        if(this._transferData) {
            transfarData = this._transferData;
        } else {
            transfarData = { mapId: this._mapId };
        }


        this.emit(NotificationKey.MAP_AREA_TRANSFER_START, transfarData);
    }

    /******************************** 传送结束 **********************************/
    private playEndAnim1() {
        BattleExpandManager.ins().transferEndAnimFadeIn();
        GameTimer.ins().once(1000, this, this.playEndAnim2);
    }

    private playEndAnim2() {
        GIns.cameraAnimUtils.zoomInMapByTransfer();
        GameTimer.ins().once(800, this, this.onEndAnimComplete);
    }

    private onEndAnimComplete() {
        // GIns.battleMgr.openFightAi();
        this.emit(NotificationKey.MAP_TRANSFER_END);
        this.closeSelf();
    }
}

UIScriptManager.bindScript(UICommonKey.TransferAnimToPointWin, TransferAnimToPointWin);