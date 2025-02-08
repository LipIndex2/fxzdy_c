import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { UIManager } from "../../../core/mvc/UIManager";
import { TableManager } from "../../../core/table/TableManager";
import NotificationKey from "../../event/NotificationKey";
import { UIActivityKey } from "../activity/const/UIActivityConfig";
import { UICommonKey } from "../common/const/UICommonConfig";
import { UIFuilKey } from "./const/fuliConst";

export class FuliController extends BaseController {

    listenNotifications(): string[] {
        return [

            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.EVENT_WORLD_BOSS_INFO_RESP,
            NotificationKey.MAP_AREA_TRANSFER_START,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case NotificationKey.SYSTEM_NEW_DAY:
                //跨天处理
                //  this.getWorldBossInfo();
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                // this.showCost();
                break;

            case NotificationKey.EVENT_WORLD_BOSS_INFO_RESP:
                //  this.showUpdate(args);
                break;
            case NotificationKey.MAP_AREA_TRANSFER_START:
                G.UIManager.close(UIFuilKey.fuliMain);
                break;
        }
    }

    public challenge(bossId: number) {
        let cfg = TableManager.getDataById(table.worldboss.WorldBossConfig, bossId);
        //去挑战或者去领奖
        //     G.FacadeManager.emit(NotificationKey.MAP_AREA_TRANSFER_START, {
        //         portalID: cfg.portalID,
        //     });
        UIManager.ins().open(UICommonKey.TransferAnimWin, { curBuildingId: 0, transferBuildingId: cfg.portalID });
        G.UIManager.close(UIActivityKey.EntranceMainView);
    }


}

FuliController.ins().doInit();