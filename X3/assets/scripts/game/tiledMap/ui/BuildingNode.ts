import { math, Rect, Vec2 } from "cc";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotPath } from "db://assets/scripts/game/modules/common/redDot/structs/RedDotPath";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import G from "../../../core/comm/G";
import FGUICocosNodeComponent from "../../../core/fgui/com/FGUICocosNodeComponent";
import { PoolManager } from "../../../core/pool/PoolManager";
import { TableManager } from "../../../core/table/TableManager";
import { MathUtils } from "../../../core/utils/MathUtils";
import GIns from "../../GIns";
import { SpineUnitNode } from "../../comm/battle/node/SpineUnitNode";
import { IRect } from "../../comm/math/ICollision";
import { AudioManager, SoundType } from "../../comm/mgr/AudioManager";
import { WorldManager } from "../../comm/world/WorldManager";
import { ConditionUtils } from "../../modules/condition/ConditionUtils";
import { MapInstanceManager } from "../../modules/mapInstance/MapInstanceManager";
import { WorldBossModel } from "../../modules/worldBoss/model/WorldBossModel";
import { IMapObject } from "../IMapObject";
import { MapObjectType } from "../MapEnum";
import { BuildingUtils } from "../config/BuildingUtils";
import { MapModel } from "../model/MapModule";
import { BuildingNameCom } from "./BuildingNameCom";
import { MapUnlockItem } from "./MapUnlockItem";

export enum AnimKey {
    lock = 1,
    unlocking = 2,
    unlocked = 3,
    activing = 4,
    actived = 5,
    unactiving = 6,
    using = 7,
}

/**
 * 地图建筑节点
 */
export class BuildingNode extends FGUICocosNodeComponent implements IRect, INotification {

    static pkgName: string = "comm";
    static viewName: string = "BuildingNode";
    static offsetY = 0;
    // 红点路径
    private _redDotPath: RedDotPath;

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName, BuildingNode) as BuildingNode;
    }

    private _rect = new Rect();

    get rect() {
        return this._rect;
    }

    public mapObject: IMapObject;
    public cfg: table.map.MapBuildingConfig;
    public actionCfg: table.map.BuildingActionConfig;

    public triggerRadius: number = 100;

    private unlockItem: MapUnlockItem;

    private nameItem: BuildingNameCom;

    protected _spineNode: SpineUnitNode;

    protected _isUnlock: boolean;

    protected _active: boolean;

    protected get view(): ui.comm.building.BuildingNode {
        return this as any;
    }

    private _redDotNotificationKey: string = null;
    private _visibleNotificationKeys: string[] = null;

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {
        if (this._visibleNotificationKeys && this._visibleNotificationKeys.indexOf(eventName) != -1) {
            this.checkVisible();
        } else if (eventName === this._redDotNotificationKey) {
            this.refreshRedDot();
        }
    }

    /**debug用到 */
    onInit() {
    }

    get buildingId() {
        return this.cfg.id;
    }

    setData(buildingConfig: table.map.MapBuildingConfig, mapObject: IMapObject) {
        this.cfg = buildingConfig;
        const buildingId = buildingConfig.id;
        this.actionCfg = TableManager.getDataById(table.map.BuildingActionConfig, buildingId);
        this._isUnlock = MapModel.ins().getBuildingUnlockById(buildingId);

        this.view.node.name = `building-${buildingId}`;

        this.mapObject = mapObject;
        this.node.setPosition(mapObject.x, mapObject.y + BuildingNode.offsetY);
        this.triggerRadius = buildingConfig.radius || this.triggerRadius;

        let d = this.triggerRadius * 2;
        this._rect.set(mapObject.x - this.triggerRadius, mapObject.y - this.triggerRadius, d, d);
        this.node._uiProps.uiTransformComp.setContentSize(d, d);

        if (!BuildingUtils.isVisible(this.cfg)) {
            this.addVisibleNotification();
        } else {
            this.resetRedDot(buildingConfig);
        }
    }

    /**添加可见的条件 */
    private addVisibleNotification() {
        this._visibleNotificationKeys = ConditionUtils.getConditionsNotificationKeys(this.cfg.showVerify);
        if (this._visibleNotificationKeys) {
            for (let i = 0; i < this._visibleNotificationKeys.length; i++) {
                FacadeManager.ins().registerByName(this._visibleNotificationKeys[i], this);
            }
        }
    }

    /**删除可见的条件 */
    private removeVisibleNotification() {
        if (this._visibleNotificationKeys) {
            for (let i = 0; i < this._visibleNotificationKeys.length; i++) {
                FacadeManager.ins().removeByName(this._visibleNotificationKeys[i], this);
            }
        }
    }

    /**检测时是否可见 */
    checkVisible() {
        if (BuildingUtils.isVisible(this.cfg)) {
            this.removeVisibleNotification();
            this.node?.active && this.setActive(true);
        }
    }


    setActive(active: boolean) {
        if (!this.node.isValid) {
            return;
        }

        if (active) {
            if (!BuildingUtils.isVisible(this.cfg)) {
                return;
            }

            if (this.cfg.building_model) {
                this.setSpine(this.cfg.building_model);
            } else if (this.cfg.building_collection) {
                this.setImage(this.cfg.building_collection);
            }
        } else {
            this._spineNode?.pause();

        }
        this.refreshRedDot(active); //重新刷新红点
    }

    setImage(path: string) {
        this.view.image.icon = path;
        this.view.image.setPosition(0, BuildingNode.offsetY);
    }

    setSpine(modleId: number) {
        if (!this._spineNode) {
            this._spineNode = PoolManager.getItem(SpineUnitNode);
            //this._spineNode.setCacheMode(sp.AnimationCacheMode.SHARED_CACHE);
            this._spineNode.loadByModelId(modleId);
            this._spineNode.setPosition(0, 0 - BuildingNode.offsetY);
            this.view._container.addChild(this._spineNode);
            this._spineNode.setNodeName(`model_${modleId}`);
            this.view.redDot.node.setSiblingIndex(10);
        }

        if (this.cfg.building_type == MapObjectType.world_boss) {
            this.worldBossAnim();
        } if (this.cfg.building_type == MapObjectType.instance) {
            this.instanceBossAnim()
        } else {
            this.playAnim(this._isUnlock ? AnimKey.unlocked : AnimKey.lock)
        }
    }

    private doPlayTransition(transitionName: string, loopName: string) {
        let hasTransition = false;
        if (transitionName) {
            this._spineNode.play(transitionName, false);
            hasTransition = true;
        }

        if (loopName) {
            if (hasTransition) {
                this._spineNode.setNextPlay(loopName, true);
            } else {
                this._spineNode.play(loopName, true)
            }
        }
    }

    protected doPlayAnim(loopName: string) {
        if (loopName) {
            this._spineNode.play(loopName, true);
        }
    }

    playAnim(type: AnimKey) {
        if (!this._spineNode) return;

        if (!this.actionCfg) {
            this._spineNode.play("idle");
            return;
        }

        switch (type) {
            case AnimKey.lock:
                this.doPlayAnim(this.actionCfg.lock);
                break;
            case AnimKey.unlocking:
                if (this._active) {
                    this.doPlayTransition(this.actionCfg.unlocking, this.actionCfg.actived);
                } else {
                    this.doPlayTransition(this.actionCfg.unlocking, this.actionCfg.unlocked);
                }
                AudioManager.ins().playSoundDelay(100, SoundType.build1)
                break;
            case AnimKey.unlocked:
                this.doPlayAnim(this.actionCfg.unlocked);
                break;
            case AnimKey.activing:
                this.doPlayTransition(this.actionCfg.activing, this.actionCfg.actived);
                AudioManager.ins().playSoundDelay(100, SoundType.build2)
                break;
            case AnimKey.actived:
                this.doPlayAnim(this.actionCfg.actived);
                break;
            case AnimKey.unactiving:
                this.doPlayTransition(this.actionCfg.unactiving, this.actionCfg.unlocked);
                AudioManager.ins().playSoundDelay(100, SoundType.build3)
                break
            case AnimKey.using:
                this.doPlayAnim(this.actionCfg.using);
                break
        }
    }

    set focus(isActive: boolean) {
        this.handleFocus(isActive)
    }

    public handleFocus(isActive: boolean, force: boolean = false): void {
        if (this._active == isActive && force == false) return;
        if (!this._isUnlock && this.cfg.autoOpen) {
            this._isUnlock = MapModel.ins().getBuildingUnlockById(this.cfg.id);
        }

        if (this._isUnlock) {
            if (this._spineNode) {
                this._active = isActive;
                if (this.cfg.building_type == MapObjectType.world_boss) {
                    //世界boss，特殊处理
                    this.worldBossAnim()
                }
                if (this.cfg.building_type == MapObjectType.instance) {
                    //副本boss，特殊处理
                    this.instanceBossAnim()
                } else {
                    this.playAnim(isActive ? AnimKey.activing : AnimKey.unactiving);
                }
            }
            if (isActive && this.cfg.building_type == MapObjectType.Raccoon) {
                //火箭浣熊
                isActive = GIns.mapVisibleMgr.isAdvertBoxShow()
            }
            this.showNameItem(isActive);
        } else {
            this.showUnlockItem(isActive);
        }
    }

    //副本boss
    public instanceBossAnim() {
        //默认激活，播放未解锁动画
        let state = AnimKey.lock;
        if (MapInstanceManager.ins().isPass(this.cfg.id)) {
            //通关后播放解锁常驻动画
            state = AnimKey.unlocked;
        }
        this.playAnim(state);
    }

    //世界boss状态，特殊处理
    public worldBossAnim() {
        let openTime = WorldBossModel.ins().getWorldBossStartTimeByBuildId(this.cfg.id);
        this._spineNode?.setColor(math.color(255, 255, 255));
        //默认激活未开启，播放为解锁动画
        let state;
        if (openTime < G.TimeManager.serverNow) {
            //已开启
            if (WorldBossModel.ins().isBossKilled(this.cfg.id)) {
                //已击杀，播放已解锁常驻动画
                state = AnimKey.unlocked
            } else {
                //未击杀，播放使用中常驻动画
                state = AnimKey.using
            }
        } else {
            //未开启
            state = AnimKey.lock;
            this._spineNode?.setColor(math.color(50, 50, 50));
        }
        this.playAnim(state);
    }

    using(isUsing: boolean) {
        this.playAnim(isUsing ? AnimKey.using : AnimKey.actived);
    }

    private showUnlockItem(isShow: boolean) {
        isShow = isShow && BuildingUtils.isShowUnlickItem(this.cfg);
        if (isShow) {
            if (this._isUnlock) {
                return;
            }

            if (!this.unlockItem) {
                this.unlockItem = fgui.UIPackage.createObject('map', 'Unlock_item') as MapUnlockItem;
                //坐标偏移
                let pos = this.cfg.uiPos || [0, 0];
                this.unlockItem.node.setPosition(this.mapObject.x + pos[0], this.mapObject.y + pos[1]);
                this.unlockItem.setId(this.mapObject.object_id);
                WorldManager.ins().tipsLayer.addChild(this.unlockItem.node);
            }
        } else {
            if (this.unlockItem) {
                this.unlockItem.dispose();
                this.unlockItem = null;
            }
        }
    }

    private showNameItem(isShow: boolean) {
        if (isShow) {
            if (this.cfg.name) {
                if (!this.nameItem) {
                    this.nameItem = BuildingNameCom.create();
                    this.nameItem.setName(this.cfg.name);
                    let pos = this.cfg.namePos || [0, 0];
                    this.nameItem.node.setPosition(this.mapObject.x + pos[0], this.mapObject.y + pos[1]);
                    WorldManager.ins().tipsLayer.addChild(this.nameItem.node);
                }

                this.nameItem.show();
                if (this.cfg.building_type == MapObjectType.world_boss) {
                    let time = WorldBossModel.ins().getWorldBossStartTimeByBuildId(this.cfg.id);
                    this.nameItem.setTime(time, this.cfg.name);
                }
            }
        } else {
            if (this.nameItem) {
                this.nameItem.hide();
            }
        }
    }

    /**解锁 */
    unlock(isActive: boolean) {
        this._isUnlock = true;
        if (this.unlockItem) {
            this.unlockItem.dispose();
            this.unlockItem = null;
        }

        if (this.cfg && !this.cfg.disappear && this.actionCfg) {
            this._active = isActive;
            this.playAnim(AnimKey.unlocking);
            this.showNameItem(isActive);
        }

        this.refreshRedDot(true);
    }

    /**聚集优先级 */
    focusPriority(teamPos: Vec2) {
        let dir = MathUtils.getDistance(teamPos.x, teamPos.y, this.mapObject.x, this.mapObject.y);
        return this.triggerRadius - dir;
    }

    protected onPreDispose() {
        if (this._redDotNotificationKey) {
            FacadeManager.ins().removeByName(this._redDotNotificationKey, this);
        }

        if (this._visibleNotificationKeys?.length) {
            FacadeManager.ins().removeByNames(this._visibleNotificationKeys, this);
        }
    }

    /**
     * 重置红点
     * @param buildingConfig
     * @private
     */
    private resetRedDot(buildingConfig: table.map.MapBuildingConfig) {
        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        if (!redDotCom) {
            return;
        }
        const moduleName = buildingConfig.moduleName;
        const moduleEnum: ServerEnums.SystemType = ServerEnums.SystemType[moduleName];
        if (buildingConfig.building_type == MapObjectType.stimulation) {
            //经营有自己的红点规则
            this._redDotPath = RedDotKeys.Stimulation;
            this._redDotNotificationKey = this._redDotPath.toEventName();
            FacadeManager.ins().registerByName(this._redDotNotificationKey, this);
        } else if (!moduleEnum) {
            if (this._redDotNotificationKey) {
                FacadeManager.ins().removeByName(this._redDotNotificationKey, this);
            }
            redDotCom.reset(RedDotKeys.Null);
        } else {
            const path = RedDotUtils.getRedDotPathByModule(moduleEnum);
            this._redDotPath = path;
            this._redDotNotificationKey = this._redDotPath.toEventName();
            FacadeManager.ins().registerByName(this._redDotNotificationKey, this);
        }

        const pos = buildingConfig.redDotOffsetPos as number[];
        try {
            if (pos && pos.length >= 2) {
                this.view.redDot.node.setPosition(pos[0], pos[1]);
                if (pos[0] < 0) {
                    this.view.redDot.setScale(-1, 1);
                } else {
                    this.view.redDot.setScale(1, 1);
                }
            }
        } catch (e) {
            console.error("建筑红点偏移. 格式错误. ", pos);
        }

        // const buildingId = buildingConfig.id;
        // console.info(`[建筑-红点] buildingId = ${buildingId}, 绑定的红点路径 = ${path}`);

        // this.refreshRedDot();
    }

    refreshRedDot(isActive: boolean = true) {
        const path1 = this._redDotPath;
        if (!path1 && !this.isAlwayShowRedDot()) {
            return;
        }
        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        if (!redDotCom) {
            return;
        }

        if (!this._isUnlock) {
            redDotCom.showByType(EnumRedDotShowType.NULL);
            return;
        } else {
            let isHave: boolean = false;
            if (this.mapObject.building_type == MapObjectType.stimulation) {
                let cfg = GIns.stimulationModel.getCfgByBuilding(this.buildingId);
                isHave = RedDotManager.ins().isHaveRedDot(path1, [cfg?.cfg?.id]) || this.isAlwayShowRedDot()
            } else {
                isHave = RedDotManager.ins().isHaveRedDot(path1) || this.isAlwayShowRedDot()
            }
            ;
            const showType = isHave ? EnumRedDotShowType.MAIN_CITY : EnumRedDotShowType.NULL;
            redDotCom.showByType(showType);
        }
        if (isActive) {
            redDotCom.playSpine();
        } else {
            redDotCom.stopSpine();
        }
    }

    /**是否总是显示红点*/
    protected isAlwayShowRedDot(): boolean {
        return this.mapObject.building_type == MapObjectType.Raccoon;
    }

    /**设置透明度*/
    public setAlpha(alpha: number): void {
        this.view.alpha = alpha;
    }
}