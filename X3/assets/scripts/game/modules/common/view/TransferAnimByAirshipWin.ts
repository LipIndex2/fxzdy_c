import { UIWin } from "../../../../core/mvc/view/UIWin";
import { IAnimOrder, ModelNode } from "../node/ModelNode";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { BattleExpandManager } from "../../../comm/battleEx/BattleExpandManager";
import NotificationKey from "../../../event/NotificationKey";
import { GameTimer } from "../../../../core/timer/GameTimer";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UICommonKey } from "../const/UICommonConfig";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import GIns from "../../../GIns";

/**召唤飞船传送 */
export class TransferAnimByAirshipWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "TransferAnimWin";

    static airshipModleId = 10010006;

    private _airship: ModelNode;

    private get view(): ui.comm.view.TransferAnimWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            //NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.LOADING_VIEW_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            //case NotificationKey.MAP_AREA_TRANSFER_END:
            //    break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                BattleExpandManager.ins().hideHeroes();
                break;
            case NotificationKey.LOADING_VIEW_COMPLETE:
                this.playEndAnim1();
                break;
        }
    }

    public onInit(): void {
        this._airship = this.view.airshipNode as ModelNode;
        this._airship.loadByModelId(TransferAnimByAirshipWin.airshipModleId);
        GIns.battleMgr.endFight();
    }

    public onOpen(onlyEndAnim: boolean = false): void {
        this.emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING);
        if (!onlyEndAnim)
            this.playStartAnim1();
    }

    public onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    /******************************** 传送开始 **********************************/
    private playStartAnim1() {
        this._airship.setCompleteListener(this.playStartAnim2.bind(this));
        let orders: IAnimOrder[] = [];
        orders.push({ name: "appear" } as IAnimOrder);
        //orders.push({ name: "idle" } as IAnimOrder);
        this._airship.playOrders(orders);
    }

    private playStartAnim2() {
        GIns.cameraAnimUtils.zoomOutByTransfer();

        this._airship.setCompleteListener(this.onStartAnimComplete.bind(this));

        let orders: IAnimOrder[] = [];
        orders.push({ name: "skill" } as IAnimOrder);
        orders.push({ name: "leave" } as IAnimOrder);
        this._airship.playOrders(orders);

        BattleExpandManager.ins().transferStartAnimFadeOut();
    }

    private onStartAnimComplete() {
        this.emit(NotificationKey.LOADING_VIEW_SHOW); //加载中
        BattleExpandManager.ins().transferByAirship(); //传送
        //BattleExpandManager.ins().transferEndAnim();
        //this.closeSelf();
    }

    /******************************** 传送结束 **********************************/
    private playEndAnim1() {
        GIns.battleMgr.endFight();
        this._airship.setCompleteListener(this.playEndAnim2.bind(this));
        let orders: IAnimOrder[] = [];
        orders.push({ name: "appear" } as IAnimOrder);
        this._airship.playOrders(orders);
    }

    private playEndAnim2() {
        GIns.cameraAnimUtils.zoomInMapByTransfer();
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

UIScriptManager.bindScript(UICommonKey.TransferAnimByAirshipWin, TransferAnimByAirshipWin)