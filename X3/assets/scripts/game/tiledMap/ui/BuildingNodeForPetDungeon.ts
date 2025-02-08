import * as fgui from "fairygui-cc";
import G from "../../../core/comm/G";
import { PoolManager } from "../../../core/pool/PoolManager";
import { SpineUnitNode } from "../../comm/battle/node/SpineUnitNode";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { BattleUIUtils } from "../../modules/battle/utils/BattleUIUtils";
import { IMapObject } from "../IMapObject";
import { MapObjectType } from "../MapEnum";
import { BuildingNode } from "./BuildingNode";
import { BuildingNodeWithUI } from "./BuildingNodeWithUI";
import { MapBuildingUI } from "./MapBuildingUI";
import { MapPetDungeon } from "./MapPetDungeon";

/**
 * 宠物副本建筑节点
 */
export class BuildingNodeForPetDungeon extends BuildingNodeWithUI {

    protected _isBuildingVisible: boolean = true;
    protected _curFloorId: number;
    protected _curModelId: number;
    protected _curFloorCfg: table.petdungeon.PetDungeonConfig;
    protected shadow: ui.commBattle.battleComp.BattleShadowBigComp;
    protected _curStarFloorId: number = 0;
    protected _isActive: boolean = false;
    protected _cfgForPetDungeon: table.petdungeon.PetDungeonBuildingConfig;

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName, BuildingNodeForPetDungeon) as BuildingNodeForPetDungeon;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_FLOOR_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.PET_DUNGEON_FLOOR_CHANGE:
                this.updateFloor();
                this.updateBuildingActiveState();
                break;
        }
    }

    /**获取缩放比例*/
    public get spineScale(): number {
        if (this._cfgForPetDungeon && this._cfgForPetDungeon.scale) {
            return this._cfgForPetDungeon.scale;
        }
        return 1;
    }

    /**获取朝向 0朝左 1朝右*/
    public get spineDirection(): number {
        if (this._cfgForPetDungeon && this._cfgForPetDungeon.direction) {
            return this._cfgForPetDungeon.direction;
        }
        return 0;
    }

    /**创建UI对象*/
    protected createBuildingUI(buildingType: string): MapBuildingUI {
        let buildingUI: MapBuildingUI = null;
        switch (buildingType) {
            case MapObjectType.petinstance:
                //宠物副本
                buildingUI = fgui.UIPackage.createObject('map', 'MapPetDungeon') as MapBuildingUI;
                break;
        }
        return buildingUI;
    }

    setData(buildingConfig: table.map.MapBuildingConfig, mapObject: IMapObject) {
        super.setData(buildingConfig, mapObject);
        this._cfgForPetDungeon = G.TableManager.getDataById(table.petdungeon.PetDungeonBuildingConfig, buildingConfig.id);
    }

    setActive(active: boolean) {
        this._isActive = active;
        this.updateFloor();
        this.updateBuildingActiveState();
    }


    setSpine(modleId: number) {
        if (!this._spineNode) {
            this._spineNode = PoolManager.getItem(SpineUnitNode);
            this._spineNode.loadByModelId(modleId);
            this._spineNode.setPosition(0, 0 - BuildingNode.offsetY);
            this.view._container.addChild(this._spineNode);
            this._spineNode.setNodeName(`model_${modleId}`);
            this.view.redDot.node.setSiblingIndex(10);
            this._spineNode.setLoadCompleteListener(this.onLoadSpineComplete.bind(this));
        }
        if (this.spineDirection > 0) {
            this._spineNode.setScale(-this.spineScale, this.spineScale);
        } else {
            this._spineNode.setScale(this.spineScale, this.spineScale);
        }
        this.doPlayAnim('idle');
    }

    public handleFocus(isActive: boolean, force: boolean = false): void {
        //去除焦点处理
    }

    protected updateFloor(): void {
        if (this._curStarFloorId != GIns.petDungeonModel.curBuildingStarFloorId) {
            this._curStarFloorId = GIns.petDungeonModel.curBuildingStarFloorId;
            let index = this.buildingId - GIns.petDungeonModel.firstFoolBuildingId;
            this._curFloorId = this._curStarFloorId + index;
            this._curFloorCfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, this._curFloorId);
            if (this._curFloorCfg) {
                // 怪物配置
                let monsters: table.monster.MonsterAttributeConfig[] = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(this._curFloorCfg.battleConfigId);
                if (monsters?.length > 0) {
                    //展示第一个怪物形象
                    this._curModelId = monsters[0].modelId;
                }
            }
        }
    }

    /**真正的展示*/
    protected updateBuildingActiveState(): void {
        let active = this._isActive;
        if (this._curFloorId <= GIns.petDungeonModel.curMaxFloorId) {
            //已通关
            active = false;
        }
        this.setBuildingUIActive(active);
        if (active) {
            if (this._curModelId > 0) {
                this.setSpine(this._curModelId);
            }
            this.createShadow();
            let uiComp = this._buildingUI as MapPetDungeon;
            if (uiComp) {
                uiComp.updateFloor(this._curFloorCfg ? this._curFloorCfg.name : '');
            }
        } else {
            this._spineNode?.pause();
        }

        if (this.shadow) {
            this.shadow.visible = active;
        }
    }

    protected onLoadSpineComplete(): void {
        this.updateShadowImgScale();
        this.updateShadowPos();
    }

    /**
    * 创建影子
    */
    protected createShadow(): void {
        //所有游戏实体角色都具有阴影
        this.initShadowImg();
        this.updateShadowImgScale();
        this.updateShadowPos();
    }

    protected initShadowImg(): void {
        if (!this.shadow) {
            //添加影子
            this.shadow = fgui.UIPackage.createObject("commBattle", "BattleShadowSmallComp") as ui.commBattle.battleComp.BattleShadowBigComp;
            GIns.worldMgr.shadowLayer.addChild(this.shadow.node);
            this.shadow.alpha = this.view.alpha;
        }
    }

    protected updateShadowImgScale(): void {
        if (this._spineNode && this.shadow)
            this.shadow.scaleX = this.shadow.scaleY = (Math.max(90, this._spineNode.modelWidth) / this.shadow.img.width) * this.spineScale;
    }

    protected updateShadowPos(): void {
        if (this.shadow) {
            this.shadow.x = this.mapObject.x;
            this.shadow.y = -this.mapObject.y;
        }
    }

    /**设置透明度*/
    public setAlpha(alpha: number): void {
        super.setAlpha(alpha);
        if (this.shadow) {
            this.shadow.alpha = alpha;
        }
    }
}