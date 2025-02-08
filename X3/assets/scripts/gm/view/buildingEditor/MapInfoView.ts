import * as fgui from "fairygui-cc";
import { UIView } from "../../../core/mvc/view/UIView";
import { MapManager } from "../../../game/tiledMap/MapManager";
import { IMapObject } from "../../../game/tiledMap/IMapObject";
import { math } from "cc";
import { TiledMap } from "cc";
import { UIGmKeys } from "../../const/UIGmKeys";
import UIScriptManager from "../../../core/comm/UIScriptManager";
import NotificationKey from "../../../game/event/NotificationKey";
import { EnumUIViewLayer } from "../../../core/comm/LayerManager";
import { GameTimer } from "../../../core/timer/GameTimer";


/**
 * GM 检查图片资源
 */
export class MapInfoView extends UIView {

    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "MapInfoView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.MAP_AREA_TRANSFER_END,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ENTER_WORLD_COMPLETE:
            case NotificationKey.MAP_AREA_TRANSFER_END:
                this.update();
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                this.updatePosTxt();
                break;
        }
    }

    // endregion
    private get view(): ui.gm.buildingEditor.MapInfoView {
        return this._view as any;
    }

    protected onInit() {
        this.view.closeBtn.onClick(this.onCloseClick, this);
        this.view.copyBtn.onClick(this.onCopyClick, this);
        this.view.ghostBtn.onClick(this.onGhostClick, this);
    }

    protected onOpen(): void {
        this.update();
    }


    update() {
        let size = MapManager.ins().getMapSize();
        this.view.idTxt.setVar("id", MapManager.ins().getMapID() + "").flushVars();
        this.view.sizeTxt.setVar("w", size.width.toFixed()).setVar("h", size.height.toFixed()).flushVars();

        this.updatePosTxt();
    }


    updatePosTxt() {
        let pos = MapManager.ins().getMapPos();
        this.view.posTxt.setVar("x", pos.x.toFixed()).setVar("y", pos.y.toFixed()).flushVars();
    }

    onCopyClick() {
        let pos = MapManager.ins().getMapPos();
        this.copyStr(`[${pos.x.toFixed()},${pos.y.toFixed()}]`);
    }

    private onCloseClick() {
        this.closeSelf();
    }

    private copyStr(str: string) {
        if (navigator.clipboard)
            navigator.clipboard.writeText(str)
        else {
            const tempTextArea = document.createElement("textarea");
            tempTextArea.value = str;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            try {
                document.execCommand('copy');
                console.log("Text copied to clipboard:", str);
            } catch (err) {
                console.error("Failed to copy text:", err);
            }

            document.body.removeChild(tempTextArea);
        }
    }

    private onGhostClick() {
        let ghost = MapManager.ins().getMapInsGhost();
        //@ts-ignore
        ghost.export();
    }
}

UIScriptManager.bindScript(UIGmKeys.MapInfoView, MapInfoView);