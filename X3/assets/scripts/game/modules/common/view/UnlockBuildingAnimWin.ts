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
import { MapModel } from "../../../tiledMap/model/MapModule";
import { IGateObject, IMapObject } from "../../../tiledMap/IMapObject";
import { director } from "cc";
import { tween } from "cc";
import { UICommonKey } from "../const/UICommonConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { MapObjectType } from "../../../tiledMap/MapEnum";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import GIns from "../../../GIns";

/**解锁建筑动画 */
export class UnlockBuildingAnimWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "TransferAnimWin";

    private _curBuildingId: number;
    private _buildCfg: table.map.MapBuildingConfig;
    private _mapObject: IMapObject;

    /**需要聚焦的门 */
    private _focusGateMapObject: IGateObject;

    /**聚焦时间 */
    private _unlockingFocusTime = 0;

    private get view(): ui.comm.view.TransferAnimWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_MIST_UNLOCKED,
            NotificationKey.MAP_BUILDING_UNLOCK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_MIST_UNLOCKED:
            case NotificationKey.MAP_BUILDING_UNLOCK:
                this.onUnlock();
                break;
        }
    }

    public onInit(): void {
        GIns.battleMgr.stopFightAi();
    }

    public onOpen(args: { curBuildingId: number }): void {
        this._curBuildingId = args.curBuildingId;
        this._mapObject = MapManager.ins().getObjectsByIDInBuilding(this._curBuildingId);
        this._buildCfg = TableManager.getDataById(table.map.MapBuildingConfig, this._curBuildingId);

        this._unlockingFocusTime = this._buildCfg.unlockingFocusTime;

        if (!this._unlockingFocusTime && this._buildCfg.building_type === MapObjectType.MIST_UNLOCKED) {
            this._focusGateMapObject = MapManager.ins().getFocusGateByBuildingId(this._curBuildingId);
            if (this._focusGateMapObject) {
                let gateCfg = TableManager.getDataById(table.map.BuildingGateConfig, this._focusGateMapObject.gate_id);
                this._unlockingFocusTime = gateCfg?.unlockingFocusTime;
            }
        }

        if (this._buildCfg.costItems) {
            this.doCostAnim();
        } else {
            this.doFocusAnim();
        }
    }

    public onClose(): void {
        GameTimer.ins().clearAll(this);
    }


    /******************************** 动画开始 **********************************/

    private doCostAnim() {
        let x = this._mapObject.x;
        let y = this._mapObject.y;

        let uesTimeMs = BattleExpandManager.ins().unlockBuildingAnim({ x: x, y: y }, this._buildCfg.costItems[0]);
        GameTimer.ins().once(uesTimeMs, this, this.doFocusAnim);
    }

    private doFocusAnim() {
        if (this._unlockingFocusTime) {
            this.playFocus();
        } else {
            this.doSendUnlock();
        }
    }

    /**聚焦 */
    private playFocus() {
        let pos = this._focusGateMapObject || this._mapObject;
        GIns.cameraAnimUtils.focusPositison(600, pos, 1.3);
        GameTimer.ins().once(500, this, this.doSendUnlock);
    }

    /**发送请求 */
    private doSendUnlock() {
        MapModel.ins().sendUnlockBuilding(this._curBuildingId);
        GameTimer.ins().once(1000, this, this.onUnlock); //防止前后端不一致卡死
    }

    /**收到已解锁 */
    private onUnlock() {
        GameTimer.ins().clearAll(this); //清理掉前面的定时器
        if (this._unlockingFocusTime) {
            GameTimer.ins().once(this._unlockingFocusTime, this, this.playUnfocus);
        } else {
            this.onEndAnimComplete();
        }
    }

    /**取消聚焦 */
    private playUnfocus() {
        GIns.cameraAnimUtils.resetFocusPositison(600);
        GameTimer.ins().once(600, this, this.onEndAnimComplete);
    }


    /**完成恢复战斗 */
    private onEndAnimComplete() {
        GIns.battleMgr.openFightAi();
        this.doUnlockJump();
        this.closeSelf();
    }

    /**解锁时跳转界面 */
    private doUnlockJump() {
        if (!this._buildCfg.unlockJumpId) return;

        if (this._buildCfg.building_type === MapObjectType.TELEPORT) {
            //传送需要带参数
            this.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE_ARGS, {
                jumpId: this._buildCfg.unlockJumpId,
                arg: { buildingId: this._buildCfg.id }
            });
        } else {
            this.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, this._buildCfg.funcJumpId);
        }
    }

}

UIScriptManager.bindScript(UICommonKey.UnlockBuildingAnimWin, UnlockBuildingAnimWin);