import { director, tween, Tween, Vec2, Node } from "cc";
import { Vec3 } from "cc";
import { TableManager } from "../../core/table/TableManager";
import { MoveCameraType, ResourceType } from "./MapEnum";
import { UIManager } from "../../core/mvc/UIManager";
import { UICommonKey } from "../modules/common/const/UICommonConfig";
import { CameraAnimBackType, CameraAnimBattleStopType, ICameraAnim } from "../modules/common/enum/AnimType";
import { v2 } from "cc";
import { IVec2Like } from "cc";
import NotificationKey from "../event/NotificationKey";
import FacadeManager from "../../core/mvc/FacadeManager";
import { TargetDownArrowComponentOpenArgs } from "../ui/guide/view/TargetDownArrowComponent";
import MapResourceController from "./resource/MapResourceController";
import { MathUtils } from "../../core/utils/MathUtils";
import GIns from "../GIns";


/**镜头动画工具类 */
export class CameraAnimUtils {
    static isTransferZoom: boolean;
    static isMovingCamera: boolean;

    /**地图 */
    static get tiledMap() {
        return GIns.mapMgr?.curMap?.mapNode() || director.getScene().getChildByPath("Canvas/MapRoot/Map");
    }

    /**获取当前缩放值 */
    static getCameraScale() {
        let mapRoot = director.getScene().getChildByPath("Canvas/MapRoot");
        return mapRoot.scale.x;
    }


    /**停止所有移镜动画 */
    static stopCameraAnim() {
        Tween.stopAllByTarget(this.tiledMap);
    }

    /**设置镜头缩放 */
    static setMapScale(scale: number) {
        let mapRoot = director.getScene().getChildByPath("Canvas/MapRoot");
        let trueScale = GIns.mapMgr.defaultMapScale * scale;
        mapRoot.scale = new Vec3(trueScale, trueScale, 1);
    }

    /**缩放摄像头 */
    static zoomMap(timeMs: number = 600, scale: number) {
        let trueScale = GIns.mapMgr.defaultMapScale * scale;
        let mapRoot = director.getScene().getChildByPath("Canvas/MapRoot");
        tween(mapRoot)
            .to(timeMs / 1000, { scale: new Vec3(trueScale, trueScale, 1) })
            .start();
    }

    /**还原到配置缩放大小 */
    static zoomMapDefault(timeMs: number) {
        let cfg = TableManager.getDataById(table.map.MapidConfig, GIns.mapMgr.getMapID());
        let mapScale = cfg.mapScale ? cfg.mapScale / 100 : 1;
        this.zoomMap(timeMs, mapScale);
    }

    /**地图拉近镜头 */
    static zoomInMap(timeMs: number) {
        this.zoomMapDefault(timeMs);
    }

    /***传送方式拉近镜头 */
    static zoomInMapByTransfer(): void {
        this.zoomInMap(600);
        this.isTransferZoom = false
    }

    /**
     * 地图拉远镜头
     */
    static zoomOutMap(timeMs: number) {
        let cfg = TableManager.getDataById(table.map.MapidConfig, GIns.mapMgr.getMapID());
        let mapScale = cfg.mapScale ? cfg.mapScale / 100 : 1;
        this.zoomMap(timeMs, mapScale * 0.778);
    }

    public isTransferZoom: boolean = false
    /***传送方式拉远镜头 */
    static zoomOutByTransfer(): void {
        this.isTransferZoom = true;
        this.zoomOutMap(600)
    }

    /**聚焦坐标 （放大+偏移）*/
    static focusPositison(timeMs: number, pos: { x: number, y: number }, scale: number) {
        let tiledMap = this.tiledMap;
        tween(tiledMap)
            .to(timeMs / 1000, { position: new Vec3(0 - pos.x, 0 - pos.y) })
            .start();
        this.zoomMap(timeMs, scale);
    }

    /**重置 聚焦*/
    static resetFocusPositison(timeMs: number) {
        let team = GIns.battleMgr.curUnitProcessor.myTeam;
        this.moveMapByTargetPos(team.pos, timeMs);
        this.zoomMapDefault(timeMs);
    }

    /**根据目标位置 移动地图到指定位置 */
    static moveMapByTargetPos(targetPos: { x: number, y: number }, timeMs: number = 500) {
        this.moveMap({ x: 0 - targetPos.x, y: 0 - targetPos.y }, timeMs);
    }

    /**移动地图到指定位置 */
    static moveMap(pos: { x: number, y: number }, timeMs: number) {
        let tiledMap = this.tiledMap;
        Tween.stopAllByTarget(tiledMap);
        tween(tiledMap)
            .to(timeMs / 1000, { position: new Vec3(pos.x, pos.y) }, { easing: "cubicInOut" })
            .start();
    }

    /**镜头移动动画 */
    static cameraMoveAnim(animData: ICameraAnim) {
        UIManager.ins().open(UICommonKey.CameraMoveAnimWin, animData);
    }

    /***移动到当前地图的镜头为止 */
    static moveCameraScreenToMapCamerPos(isTween: boolean = false): void {
        let cfg = GIns.mapMgr.getMapCfg()
        if (cfg && cfg.cameraPos && cfg.cameraPos.length == 2) {
            // event 镜头移动
            if (!isTween) {
                this.tiledMap.setPosition(- +cfg.cameraPos[0], - +cfg.cameraPos[1])
            }
            else
                this.moveCameraScreenToMapPosTween(v2(+cfg.cameraPos[0], +cfg.cameraPos[1]), 0.5, MoveCameraType.FIGHT_LOCK_MOVE)
        }
    }

    static moveTween: Tween<Node>
    /**
     * 传送镜头到目标点 by tween
     * */
    static moveCameraScreenToMapPosTween(pos: Vec2, speed: number, type: MoveCameraType) {
        const targetX = pos.x;
        const targetY = pos.y;

        if (type == MoveCameraType.FIGHT_LOCK_MOVE) {
            if (!this.moveTween) {
                this.moveTween = tween(this.tiledMap)
                    .to(speed, { position: new Vec3(0 - targetX, 0 - targetY, 0) })
                    .call(() => {
                        this.onMoveTweenComplete();
                    })
                    .start();
            }
        }
        else if (type == MoveCameraType.FIGHT_LOCK_CTRL_MOVE) {
            Tween.stopAllByTarget(this.tiledMap);
            this.onMoveTweenComplete();


            const dx = pos.x - Math.abs(this.tiledMap.position.x);
            const dy = pos.y - Math.abs(this.tiledMap.position.y);


            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= speed) {
                this.tiledMap.setPosition(-Math.floor(pos.x), -Math.floor(pos.y))
                return
            }

            const ratio = speed / distance;
            const nextX = Math.abs(this.tiledMap.position.x) + dx * ratio;
            const nextY = Math.abs(this.tiledMap.position.y) + dy * ratio;
            this.tiledMap.setPosition(-Math.floor(nextX), -Math.floor(nextY))
        }
    }

    static onMoveTweenComplete(): void {
        this.moveTween = null;
    }

    /*聚焦指定点 并显示箭头 */
    static focusPos(pos: IVec2Like) {
        if (!pos) return;
        let animParam: ICameraAnim = {
            targetPos: { x: pos.x, y: pos.y }
            , timeMs: 800
            , backType: CameraAnimBackType.TouchBack
            , battleStopType: CameraAnimBattleStopType.StopAll
        }
        // 镜头移动
        this.cameraMoveAnim(animParam);

        // event 指引箭头
        FacadeManager.ins().emit(NotificationKey.TASK_GUIDE_TO_TARGET_DOWN_ARROW, {
            mapPosition: { x: pos.x, y: pos.y + 50 },
            delaySecond: 1
        } as TargetDownArrowComponentOpenArgs)
    }

    /**任务聚焦最近资源点 (性能较差)*/
    static taskFocusNearestResourceId(resourcePointId) {
        let cfg = TableManager.getDataById(table.map.MapResourceConfig, resourcePointId);
        if (!cfg) return;
        let curPos: IVec2Like;

        switch (cfg.type) {
            case ResourceType.MONSTER:
                let mapMonsterCfg = TableManager.getDataById(table.map.MapMonsterConfig, cfg.mapMonsterId);
                let monsterUnit = GIns.battleExpandMgr.findNearestMonsterUnit(mapMonsterCfg.monsterId);
                if (monsterUnit) {
                    monsterUnit.stopMove();
                    curPos = monsterUnit.pos;
                }
                break;
            case ResourceType.MINERAL:
                let mineralUnit = GIns.battleExpandMgr.findNearestMineralUnit(cfg.mapMineralId);
                if (mineralUnit) {
                    curPos = mineralUnit.pos;
                }
                break;
        }

        if (!curPos) {
            let max = 20;
            let resourcePoints = MapResourceController.ins().getAllSameResourcePoint(resourcePointId);
            if (!resourcePoints?.length) return;

            let curPos = GIns.mapMgr.getMapPos();
            resourcePoints = resourcePoints.sort((a, b) => {
                return MathUtils.distance(curPos, a.pos) - MathUtils.distance(curPos, b.pos);
            })


            if (resourcePoints.length > max) {
                //只有前20就够了
                resourcePoints.length = max;
            }

            let resourceIds: number[] = [];
            for (let i = 0; i < resourcePoints.length; i++) {
                resourceIds.push(resourcePoints[i].id);
            }

            GIns.mapModel.sendLoadSurvivalMapResources(resourceIds, (survivals: number[]) => {
                if (survivals?.length) {
                    for (let i = 0; i < resourcePoints.length; i++) {
                        if (survivals.indexOf(resourcePoints[i].id) != -1) {
                            this.focusPos(resourcePoints[i].pos);
                            return;
                        }
                    }
                }

                this.focusPos(resourcePoints[0].pos); //没有就最近的

            });
            return;
        }

        this.focusPos(curPos);
    }

    /***终止当前的镜头缓动 */
    // static stopMoveTween(): void {
    //     if (this.moveCameraTween) {
    //         this.moveCameraTween.stop();
    //         this.onMoveTweenComplete();
    //     }
    //     G.FacadeManager.emit(NotificationKey.TOUCH_ENABLE);
    //     G.Canvas.once
    // }

    // /**移动镜头结束 */
    // protected static onMoveTweenComplete(): void {
    //     this.isMovingCamera = false;
    //     this.moveCameraTween = null;
    //     G.FacadeManager.emit(NotificationKey.TOUCH_ENABLE);
    // }

}
