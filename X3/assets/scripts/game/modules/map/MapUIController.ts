import G from "../../../core/comm/G";
import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import NotificationKey from "../../event/NotificationKey";
import { MapManager } from "../../tiledMap/MapManager";
import { MapModel } from "../../tiledMap/model/MapModule";
import { UICommonKey } from "../common/const/UICommonConfig";
import { MapInstanceManager } from "../mapInstance/MapInstanceManager";
import { UIMapInstanceKey } from "../mapInstance/const/UIMapInstanceConfig";
import { UIMapKey } from "./const/UIMapConfig";


/** mapUI */
export class MapUIController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.BOOS_FIRST_KILL,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_AREA_TRANSFER_END:
                this.sendTargetTeleportId();
                break;
            case NotificationKey.BOOS_FIRST_KILL:
                this.bossFirstKill(args);
                break;
        }
    }



    /** boss首杀 */
    private bossFirstKill(args: any) {
        //打开boss首杀界面
        UIManager.ins().open(UIMapKey.MAP_BOSS_FIRST_KILL, args)
    }

    /** 发送传送点给后端 */
    private sendTargetTeleportId() {
        if (MapManager.ins().targetTeleportId) {
            MapModel.ins().sendTeleportEvent(MapManager.ins().targetTeleportId);
            MapManager.ins().targetTeleportId = null;
        }

        // //进入副本
        // if(MapManager.ins().getMapID() == MapInstanceManager.ins().mapId){
        //     UIManager.ins().open(UIMapInstanceKey.MapInstanceView);
        // }
    }

    public transferToMap(curBuildingId: number | null,
                         targetBuildId: number
    ) {
        UIManager.ins().open(UICommonKey.TransferAnimWin, {
            curBuildingId: curBuildingId,
            transferBuildingId: targetBuildId
        });
    }

}

MapUIController.ins().doInit();
