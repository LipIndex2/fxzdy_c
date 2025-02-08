import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { Handler } from "../../../core/utils/Handler";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import { IBattleResultWinData } from "../battle/vo/IBattleResultWinData";
import { I18nMapInstanceKey, UIMapInstanceKey } from "./const/UIMapInstanceConfig";
import { MapInstanceManager } from "./MapInstanceManager";

/** mapUI */
export class MapInstanceController extends BaseController {
    private _data;

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_INSTANCE_CHALLENGE_RESULT,
            NotificationKey.MAP_INSTANCE_UPDATE_BOSS,
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.BATTLE_START,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.TRIGGER_CREATE_MONSTER,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_INSTANCE_CHALLENGE_RESULT:
                this.challengeResult(args);
                break;
            case NotificationKey.MAP_INSTANCE_UPDATE_BOSS:
                this.updateBoss();
                break;
            // case NotificationKey.BATTLE_START:
            //     // this.openView();
            //     break;
            // case NotificationKey.ENTER_WORLD_COMPLETE:
            // this.openView();
            // break;
            case NotificationKey.TRIGGER_CREATE_MONSTER:
                this.updateMonster(args);
                break;
        }
    }

    /** 副本战斗结果 */
    private challengeResult(data: Vo.map.MapInstanceChallengeVo) {
        if (data.mapInstanceId != MapInstanceManager.ins().mapInstanceId) return;
        this._data = data;
        if (data.win) {
            //胜利
            this.emit(NotificationKey.BATTLE_RESULT_WIN, {
                fightType: FightType.MAP_INSTANCE,
                exData: data.rewardResults,
                isWin: true,
            } as IBattleResultWinData)
            MapInstanceManager.ins().passMapInstanceId = data.mapInstanceId;
        }
        else {
            //失败
            this.emit(NotificationKey.BATTLE_RESULT_WIN, { isWin: false, closeCllBack: Handler.create(this, this.back) } as IBattleResultWinData)
        }
    }

    /** 关闭结算界面回调 */
    private back() {
        G.FacadeManager.emit(NotificationKey.LOADING_VIEW_SHOW);
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW)
        G.UIManager.close(UIMapInstanceKey.MapInstanceView);
        // G.FacadeManager.emit(NotificationKey.EXIT_BATTLE);
        MapInstanceManager.ins().mapInstanceId = null;
    }

    /** 刷新副本boss */
    private updateBoss() {
        G.UIManager.open(UIMapInstanceKey.BossArriveView, { title: I18nMapInstanceKey.bossArrive, resourceIds: [-1] });
    }

    /** 刷新副本boss */
    private updateMonster(resourceIds: number[]) {
        G.UIManager.open(UIMapInstanceKey.BossArriveView, { title: I18nMapInstanceKey.manyMonsterArrive, resourceIds });
    }

    /** 进入地图副本 */
    private enterMapInstance() {
        // let mapCfg = TableManager.getDataById(table.map.MapidConfig, MapInstanceManager.ins().mapId);
        // if(!mapCfg) {
        //     console.log("没有该id的地图, id:" + MapInstanceManager.ins().mapId);
        //     return;
        // }
        // this.emit(NotificationKey.LOADING_VIEW_SHOW); //加载中
        // this.emit(NotificationKey.MAP_AREA_TRANSFER_START, {portalID: mapCfg.id, pos: {x:mapCfg.transferPos[0], y:mapCfg.transferPos[1]}});
        // G.UIManager.open(UICommonKey.TransferAnimWin, { curBuildingId: this._curBuildingId, transferBuildingId: this._cfg.building_id });
        // this.emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING);

        // this.doAnim();
    }

    // private doAnim() {
    //     // MapManager.ins().getUsingBuilding(this._curBuildingId);
    //     GIns.cameraAnimUtils.zoomOutByTransfer()
    //     GameTimer.ins().once(800, this, this.playStartAnim1);
    // }

    // /******************************** 传送开始 **********************************/
    // private playStartAnim1() {
    //     BattleExpandManager.ins().transferStartAnimFadeOut();
    //     GameTimer.ins().once(1100, this, this.transfear);
    // }

    // private transfear() {
    //     let mapCfg = TableManager.getDataById(table.map.MapidConfig, MapInstanceManager.ins().mapId);
    //     if(!mapCfg) {
    //         console.log("没有该id的地图, id:" + MapInstanceManager.ins().mapId);
    //         return;
    //     }
    //     this.emit(NotificationKey.LOADING_VIEW_SHOW); //加载中
    //     this.emit(NotificationKey.MAP_AREA_TRANSFER_START, {portalID: mapCfg.id, pos: {x:mapCfg.transferPos[0], y:mapCfg.transferPos[1]}});
    // }

    // /******************************** 传送结束 **********************************/
    // private enterAnim() {
    //     BattleExpandManager.ins().transferEndAnimFadeIn();
    //     GameTimer.ins().once(1000, this, this.playEndAnim2);
    // }

    // private playEndAnim2() {
    //     GIns.cameraAnimUtils.zoomInMapByTransfer();
    //     GameTimer.ins().once(800, this, this.openView);
    // }

    // private openView() {
    //     //打开战斗界面
    //     // if (MapManager.ins().getMapID() == MapInstanceManager.ins().mapId) {
    //     //     G.UIManager.open(UIMapInstanceKey.MapInstanceView);
    //     // }

    //     if (this._data && this._data.win) {
    //         if (this._data.mapInstanceId == 4021001) {
    //             //打开首充
    //             G.GameTimer.once(500, this, () => {
    //                 {
    //                     G.UIManager.open(UIActivityKey.FirstChargeWin);
    //                 }
    //             })
    //         }
    //         this._data = null;
    //     }
    // }
}
MapInstanceController.ins().doInit();