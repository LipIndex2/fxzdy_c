import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import * as fgui from "fairygui-cc";
import { Node, Vec2, v2 } from 'cc';
import NotificationKey from "../../../event/NotificationKey";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import BattleSetting from "../../../comm/battle/config/BattleSetting";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { UIJoystickKey } from "../const/UIJoystickConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { NodeEventType } from "cc";
import { director } from "cc";

export class JoystickView extends UIView {

    static pkgName: string = "comm";
    static viewName: string = "JoystickView";
    public _layer = EnumUIViewLayer.CONTROLLER;
    protected adaptType = ViewAdaptType.BOTTOM;

    private _startPos: Vec2 = v2();
    private _tempVec: Vec2 = v2();

    private _isMoving = false;

    private _tiledMapNode: Node;

    private get view(): ui.comm.view.JoystickView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ENTER_WORLD:
                this.showHideJoystick();
                break;
        }
    }

    public onInit(): void {
        this._tiledMapNode = director.getScene().getChildByPath("Canvas/MapRoot/Map");
        this._tiledMapNode.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this.showHideJoystick, this);

        this.view.on(fgui.Event.TOUCH_BEGIN, this.onTouchStart, this);
        this.view.on(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
        this.view.on(fgui.Event.TOUCH_END, this.onTouchEnd, this);
        // joystick 
        // fgui.GRoot.inst.on(fgui.Event.TOUCH_BEGIN, this.onTouchStart, this);
        // fgui.GRoot.inst.on(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
        // fgui.GRoot.inst.on(fgui.Event.TOUCH_END, this.onTouchEnd, this);
        this.view.joystick.visible = true;
        this.view.joystick.setPosition(this.view.nodePoint.x, this.view.nodePoint.y);
    }

    public onOpen(): void {
    }

    public onClose(): void {
    }

    private showHideJoystick() {
        this.view.joystick.visible = this._tiledMapNode.active && !BattleManager.ins().battleLogic.battleSetting.hideCtrlRocker;
    }

    private onTouchStart(evt: fgui.Event) {
        if (BattleManager.ins().battleLogic.battleSetting.hideCtrlRocker)
            return

        let x = evt.pos.x;
        let y = evt.pos.y;
        let pos = this._tempVec.set(x, y);

        this._startPos.set(pos);
        this._isMoving = false;
        this.view.joystick.setPosition(pos.x, pos.y);
        this.view.joystick.dirGp.visible = false;
        evt.captureTouch(); //标记命中目标
    }

    private onTouchMove(evt: fgui.Event) {
        let x = evt.pos.x;
        let y = evt.pos.y;
        let pos = this._tempVec.set(x, y);

        if (this._isMoving) {
            let radians = MathUtils.getRadians(this._startPos.x, this._startPos.y, pos.x, pos.y);
            let angle = MathUtils.radians2Angle(radians);
            this.view.joystick.centerNode.setPosition(40 * Math.cos(radians), 40 * Math.sin(radians));

            this.view.teamDir.visible = true;
            this.view.teamDir.rotation = angle;

            this.emitNow(NotificationKey.JOYSTICK_CHANGED, -angle);
        } else {
            if (Vec2.distance(pos, this._startPos) > 10) {
                this._isMoving = true;
            }
        }
    }

    private onTouchEnd(evt: fgui.Event) {
        if (BattleManager.ins().battleLogic.battleSetting.hideCtrlRocker)
            return
        this.view.joystick.centerNode.setPosition(0, 0);
        this.view.joystick.setPosition(this.view.nodePoint.x, this.view.nodePoint.y);
        this.view.joystick.dirGp.visible = true;
        this.view.teamDir.visible = false;

        this._isMoving = false;
        this._startPos.set(0, 0);
        this.emitNow(NotificationKey.JOYSTICK_END, null);
        if (BattleManager.ins().isLockCamera)
            GIns.cameraAnimUtils.moveCameraScreenToMapCamerPos(true)
    }
}

UIScriptManager.bindScript(UIJoystickKey.JOYSTICK_VIEW, JoystickView);