import { UIWin } from "../../../../core/mvc/view/UIWin";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { BattleExpandManager } from "../../../comm/battleEx/BattleExpandManager";
import NotificationKey from "../../../event/NotificationKey";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { IAnimOrder, ModelNode } from "../../common/node/ModelNode";
import { MapManager } from "../../../tiledMap/MapManager";
import { UIGuideConfig } from "../const/UIGuideConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import GIns from "../../../GIns";

/**引导的上飞船回城 */
export class TransferAnimByGuideWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "TransferAnimWin";

    static airshipModleId = 10010006;

    private _airship: ModelNode;

    private get view(): ui.comm.view.TransferAnimWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.LOADING_VIEW_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ENTER_WORLD_COMPLETE:
                BattleExpandManager.ins().hideHeroes();
                break;
            case NotificationKey.LOADING_VIEW_COMPLETE:
                //this.playEndAnim1();
                this.fullView();
                break;
        }
    }

    public onInit(): void {
        this._airship = this.view.airshipNode as ModelNode;
        this._airship.loadByModelId(TransferAnimByGuideWin.airshipModleId);
        this._airship.visible = false; //使用地图上的飞船
        GIns.battleMgr.endFight();
    }

    public onOpen(): void {
        this.emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING);
        this.playStartAnim1();
    }

    public onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    /******************************** 传送开始 **********************************/
    private playStartAnim1() {
        let node = MapManager.ins().getBuildingNode(2006); //引导中的飞船建筑物Id
        //@ts-ignore
        let spine = node?._spineNode;
        if (spine) {
            spine.play("skill");
            spine.setNextPlay("leave");
        }

        GIns.cameraAnimUtils.zoomOutByTransfer();
        BattleExpandManager.ins().transferStartAnimFadeOut();

        GameTimer.ins().once(1800, this, this.onStartAnimComplete);
    }


    private onStartAnimComplete() {
        this.emit(NotificationKey.LOADING_VIEW_SHOW); //加载中
        GIns.cameraAnimUtils.setMapScale(0.2);
        BattleExpandManager.ins().transferByAirship(); //传送
    }

    private fullView() {
        GameTimer.ins().once(800, this, this.delay);
    }

    private delay() {
        GIns.cameraAnimUtils.zoomInMap(1500);
        GameTimer.ins().once(1000, this, this.playEndAnim1);
    }

    /******************************** 传送结束 **********************************/
    private playEndAnim1() {
        GIns.cameraAnimUtils.isTransferZoom = false;
        GIns.battleMgr.endFight();
        this._airship.setCompleteListener(this.playEndAnim2.bind(this));
        this._airship.visible = true;
        let orders: IAnimOrder[] = [];
        orders.push({ name: "appear" } as IAnimOrder);
        this._airship.playOrders(orders);
    }

    private playEndAnim2() {
        GIns.cameraAnimUtils.isTransferZoom = false;
        //GIns.cameraAnimUtils.zoomInMapByTransfer();
        this._airship.setCompleteListener(this.onEndAnimComplete.bind(this));
        let orders: IAnimOrder[] = [];
        orders.push({ name: "skill_invert" } as IAnimOrder);
        orders.push({ name: "leave" } as IAnimOrder);
        this._airship.playOrders(orders);

        BattleExpandManager.ins().transferEndAnimFadeIn();
    }

    private onEndAnimComplete() {
        GIns.battleMgr.startFight();
        this.closeSelf();
    }
}

UIScriptManager.bindScript(UIGuideConfig.TransferAnimByGuideWin, TransferAnimByGuideWin);
