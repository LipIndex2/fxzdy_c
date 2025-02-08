import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { MiniMapCollectionItem } from "./item/MiniMapCollectionItem";
import { MiniMapCollectionListItem } from "./item/MiniMapCollectionListItem";
import { MiniMapIconItem } from "./item/MIniMapIconItem";
import { MiniMapItem } from "./item/MiniMapItem";
import { MiniMapShowBuildingItem } from "./item/MiniMapShowBuildingItem";

/** mapUI */
export class MiniMapController extends BaseController {
    listenNotifications(): string[] {
        return [NotificationKey.MAP_INSTANCE_CHALLENGE_RESULT, NotificationKey.MAP_COLLECT_RESOURCE, NotificationKey.MAP_TASK_REWARD, NotificationKey.MAP_TASK_REFRESH];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_INSTANCE_CHALLENGE_RESULT:
                // this.challengeResult(args);
                break;
            case NotificationKey.MAP_COLLECT_RESOURCE:
                this.challengeResult(args);
                break;
            case NotificationKey.MAP_TASK_REWARD:
            case NotificationKey.MAP_TASK_REFRESH:
                this.refreshRedDot();
                break;
        }
    }

    onInit(): void {
        //绑定脚本给组件
        G.FGUIManager.bindScript("ui://comm/MiniMapItem", MiniMapItem);
        G.FGUIManager.bindScript("ui://miniMap/MiniMapCollectionItem", MiniMapCollectionItem);
        G.FGUIManager.bindScript("ui://miniMap/MiniMapCollectionListItem", MiniMapCollectionListItem);
        G.FGUIManager.bindScript("ui://miniMap/MiniMapIconItem", MiniMapIconItem);
        G.FGUIManager.bindScript("ui://comm/MiniMapShowBuildingItem", MiniMapShowBuildingItem);
    }

    //地图采集资源
    private challengeResult(args: any) {
        let starVo = GIns.miniMapMgr.MapInfoVoByStarId();
        if (starVo) {
            let keys = Object.keys(starVo.drawResourceMap);
            let starResourceList = GIns.miniMapMgr.getStarResourceMap(GIns.miniMapMgr.MapStarId);
            for (let key of keys) {
                for (let data of args) {
                    if (data.baseId == key) {
                        if (starVo.drawResourceMap[key]) {
                            let max = starResourceList[key];
                            if (starVo.drawResourceMap[key] < max) {
                                starVo.drawResourceMap[key] += data.amount;
                                if (starVo.drawResourceMap[key] >= max) {
                                    G.FacadeManager.emit(NotificationKey.MAP_RESOURCE_REACH_MAX, key);
                                }
                            }
                        } else {
                            starVo.drawResourceMap[key] = data.amount;
                        }
                    }
                }
            }
        }
    }

    //刷新红点
    private refreshRedDot() {
        GIns.miniMapMgr.refreshMiniMapRedPoint();
    }
}
MiniMapController.ins().doInit();
