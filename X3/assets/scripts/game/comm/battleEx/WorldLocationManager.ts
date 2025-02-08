import { IVec2Like } from "cc";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TimeManager } from "../../../core/time/TimeManager";
import NotificationKey from "../../event/NotificationKey";
import BattleSetting from "../battle/config/BattleSetting";
import { FightType } from "../battle/enum/FightType";
import LocalStorage from "../cache/LocalStorage";
import GIns from "../../GIns";

/**世界地图位置记录管理器 */
export class WorldLocationManager extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.MAP_TEAN_POS_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_AREA_TRANSFER_END:
                this.saveMapPos(true);
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                this.saveMapPos();
                break;
        }
    }

    /**上次保存的时间 */
    private _nextSaveTime = -1;

    /**可保存间隔 */
    private _saveInterval = 5000;

    /**五分钟 */
    private _saveVaildTime = 5 * 60 * 1000;

    /**2分钟 */
    private _2MINUTE = 2 * 60 * 1000;


    /**保存当前位置，下次登录回到该点 */
    private saveMapPos(focus: boolean = false) {
        if (BattleSetting.playingMethod !== FightType.TRUNK_MAP) return;
        let time = TimeManager.serverNow;
        if (focus || time > this._nextSaveTime) {
            this._nextSaveTime = time + this._saveInterval;
            let mapId = GIns.mapMgr.getMapID();
            let pos = GIns.mapMgr.getMapPos();
            if (!mapId && !pos) {
                return;
            }

            let oldData = LocalStorage.player.worldMapLocation;
            if (oldData && oldData.pos?.x == pos.x && oldData.pos?.y == pos.y) {
                if (oldData.vaildTime - time > this._2MINUTE) {
                    //相同位置 有效时间大于两分钟 不保存
                    return;
                }
            }

            let data = {
                vaildTime: time + this._saveVaildTime,
                mapId: mapId,
                pos: pos
            }
            LocalStorage.player.worldMapLocation = data;
        }
    }

    /**获取下线时的位置 */
    public getOfflineWorldLocation(): { mapId: number, pos: IVec2Like } {
        let data = LocalStorage.player.worldMapLocation;
        if (data) {
            let time = TimeManager.serverNow;
            if (data.vaildTime > time) {
                return data;
            }
        }

        return null;
    }

    /**清理位置记录 */
    public cleanLocation() {
        LocalStorage.player.worldMapLocation = null;
    }
}

WorldLocationManager.ins().doInit();