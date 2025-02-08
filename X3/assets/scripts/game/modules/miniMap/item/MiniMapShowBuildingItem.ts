import { v2 } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import FGUILoader from "../../../../core/fgui/com/FGUILoader";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { Logger } from "../../../../core/log/Logger";
import { UIManager } from "../../../../core/mvc/UIManager";
import { TableManager } from "../../../../core/table/TableManager";
import GIns from "../../../GIns";
import { MapObjectType } from "../../../tiledMap/MapEnum";
import { MapManager } from "../../../tiledMap/MapManager";
import MapResourceController from "../../../tiledMap/resource/MapResourceController";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { LeaugeExploreBuildingOccupyState } from "../../leagueExplore/const/LeagueExploreEnum";
import { UIMiniMapKey } from "../const/UIMiniMapConfig";
import { MiniMapIconItem } from "./MIniMapIconItem";
import { MiniMapAreaItem } from "./MiniMapAreaItem";
import ArrayUtils from "../../../../core/utils/ArrayUtils";

export class MiniMapShowBuildingItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "MiniMapShowBuildingItem";

    //所有地图
    private _mapIcons: FGUILoader[];
    //拼接地图后，Y方向上需要修正的偏移
    private _offsetY: number

    //地图表, 单地图模式下
    private _mapCfg: table.map.MapidConfig;
    //地图表，多地图拼接模式下
    private _multiMapCfg: table.map.MapidConfig[];

    //当前地图建筑表
    private _mapBuildingCfgs: table.map.MapBuildingConfig[];
    //当前地图资源点表
    private _mapResourceCfgs: table.map.MapResourceConfig[];
    //现实条件表
    // private _mapBuildingConditionCfg:table.map.MapBuildingConditionConfig;
    //建筑图标Map
    private _buildingMap: Map<number, MiniMapIconItem> = new Map();
    //建筑区域Map
    private _buildingAreaMap: Map<number, MiniMapAreaItem> = new Map();

    /** 是否播放动画 */
    private _isShowPlayer = false;

    //小地图默认缩放
    private _scale: number;
    private _iconScale: number = 0;

    protected _curMapIds:number[] = null;

    private get view(): ui.comm.miniMap.MiniMapShowBuildingItem {
        return this as any;
    }

    onInit(): void {
        this._mapIcons = [this.view.map0 as any];
        this.view.map0.on(fgui.Event.SIZE_CHANGED, this.onMapSizeChg, this);
    }

    public dispose() {
        super.dispose();
        for (let icon of this._buildingMap.values()) {
            icon.dispose();
        }
        for (let icon of this._buildingAreaMap.values()) {
            icon.dispose();
        }
    }

    public updateData(isShowPlayer: boolean = false, id?: number) {
        this._mapCfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        if (!this._mapCfg) return;
        this.clearMapShow();
        this.assembleMultiMap()

        // let keys = Object.keys(this._buildingMap);
        // for(let key of keys){
        //     this._buildingMap[key].dispose();
        //     delete this._buildingMap[key];
        // }

        if (isShowPlayer) {
            this._isShowPlayer = isShowPlayer;
        }
        //修改多次调用 iconScale反复变化问题
        if (!this._iconScale) {
            this._iconScale = isShowPlayer ? 0.5 * this._mapCfg.default_scale : 0.5;
        }

        if (!this._scale) {
            this._scale = this._mapCfg.default_scale;
        }

        if (this._mapCfg.showBuildingInMini) {
            let self = this;
            G.GameTimer.once(100, self, () => {
                if (this.view?.node?.isValid) {
                    self.setMiniMapIcon(id);
                }
            });
        }
    }

    @LogBusiness("清除小地图显示")
    public clearMapShow() {
        if (this._curMapIds && ArrayUtils.equal(this._curMapIds, GIns.mapMgr.getMultiMapIDS())) {
            //同样的地图就不清除旧的地图展示
            return
        }
        this._mapIcons.forEach(l => {
            l.icon = "";
        });
    }

    @LogBusiness("创建小地图显示")
    public assembleMultiMap() {
        //保存当前地图列表
        this._curMapIds = GIns.mapMgr.getMultiMapIDS();
        if (GIns.mapMgr.curMap.isMultiMap() == false) {
            //单地图处理
            this._mapIcons[0].icon = GIns.miniMapMgr.getMiniMapPath();
            this.view.map.setPosition(0, 0);
            return
        }

        //多地图拼接处理
        this._multiMapCfg = GIns.mapMgr.getMultiMapIDS().map(id => {
            return TableManager.getDataById(table.map.MapidConfig, id);
        });

        this._offsetY = 0;
        let totalMaps = this._multiMapCfg.length;
        //下面的坐标都是在fgui坐标系下的
        let accuOffset = v2(), lastOut = v2();
        let i = 0;
        let group = this.view.map;
        group.x = group.y = 0;
        for (; i < totalMaps; ++i) {
            let map = this._mapIcons[i];
            if (!map) {
                map = new FGUILoader();
                map.sortingOrder = i;
                map.name = map.node.name = `map${i}`;
                map.group = group;
                map.autoSize = true;
                map.on(fgui.Event.SIZE_CHANGED, this.onMapSizeChg, this);
                // map.autoSize = true;
                this._mapIcons.push(map)
                this.view.addChild(map);
            }
            map.visible = true;

            let mapCfg = this._multiMapCfg[i]
            let inOutPos = mapCfg.inOutPos;
            map.icon = mapCfg.mapPath;

            if (i == 0) {
                lastOut.set(inOutPos[0], inOutPos[1]);
                map.x = map.y = 0;
            } else {
                accuOffset.add2f(lastOut.x - inOutPos[0], lastOut.y - inOutPos[1]);
                map.x = accuOffset.x;
                map.y = accuOffset.y;
                lastOut.set(inOutPos[2], inOutPos[3]);

                this._offsetY = Math.min(this._offsetY, accuOffset.y);
            }
            Logger.game(`小地图：${i}, mapId:${mapCfg.id}, x:${accuOffset.x}, y:${accuOffset.y}`);
        }
        this._offsetY = -this._offsetY;

        for (; i < this._mapIcons.length; ++i) {
            this._mapIcons[i].visible = false;
        }

        this.adjustMinMapPos();
        group.ensureBoundsCorrect();
    }

    //地图建筑图标
    public setMiniMapIcon(id?: number) {
        this._mapBuildingCfgs = GIns.miniMapMgr.getBuildingCfgs();
        if (id) {
            let buildingCfg = TableManager.getDataById(table.map.MapBuildingConfig, id);
            this.setBuildingIcon(buildingCfg);
        } else {
            // 清理原本的建筑图标
            let ids = Object.keys(this._buildingMap);
            for (let id of ids) {
                let item = this._buildingMap[id];
                item.dispose();
                delete this._buildingMap[id];
            }

            for (let cfg of this._mapBuildingCfgs) {
                this.setBuildingIcon(cfg);
            }
        }

        this.setResourcePoint(id);

        //玩家位置动画
        this.playerPos();
    }

    /**创建图标*/
    protected createBuildingIcon(): MiniMapIconItem {
        return fgui.UIPackage.createObject("comm", "MiniMapIconItem") as MiniMapIconItem;
    }

    /**创建区域*/
    protected createBuildingArea(): MiniMapAreaItem {
        return fgui.UIPackage.createObject("comm", "MiniMapAreaItem") as MiniMapAreaItem;
    }

    //设置建筑图标
    private setBuildingIcon(cfg: table.map.MapBuildingConfig) {
        if (!cfg) return;
        let buildingNode = MapManager.ins().getBuildingNode(cfg.id);
        if (!buildingNode) {
            if (this._buildingMap[cfg.id]) {
                this._buildingMap[cfg.id].visible = false;
            }
            if (this._buildingAreaMap[cfg.id]) {
                this._buildingAreaMap[cfg.id].visible = false;
            }
            return;
        }

        // if (cfg.building_type == MapObjectType.instance) {
        //     if (this._buildingMap[cfg.id] && MapManager.ins().getBuildingUnlockById(cfg.id)) {
        //         this._buildingMap[cfg.id].visible = false;
        //         // return;
        //     }
        // }

        let iconItem: MiniMapIconItem;
        if (this._buildingMap[cfg.id]) {
            iconItem = this._buildingMap[cfg.id];
        } else {
            iconItem = this.createBuildingIcon();
            this._buildingMap[cfg.id] = iconItem;
            this.view.addChild(iconItem);
            iconItem.node.name = `${cfg.id}`;
        }
        iconItem.setLv(cfg.lv);
        this.updateBuildingIcon(iconItem, cfg);
        iconItem.visible = GIns.miniMapMgr.isBuildingShow(cfg.id);
        let x = buildingNode.mapObject.x / this._mapCfg.scale[0] + this.view.map.x - this._mapCfg.offset[0];
        let y = this.view.map.height - buildingNode.mapObject.y / this._mapCfg.scale[1] + this.view.map.y + this._mapCfg.offset[1];
        iconItem.node.setPosition(x, -y);

        iconItem.setScale(this._iconScale, this._iconScale);

        /** 播放动画 */
        this.playAnim(iconItem, cfg);

        //添加点击事件
        if (cfg.building_type == MapObjectType.TELEPORT) {
            this.setBuildingIconClick(iconItem, cfg);
        }

        if (cfg.building_type == MapObjectType.factories) {
            //需要展示区域
            let areaItem:MiniMapAreaItem;
            if (this._buildingAreaMap[cfg.id]) {
                areaItem = this._buildingAreaMap[cfg.id];
            } else {
                areaItem = this.createBuildingArea();
                this._buildingAreaMap[cfg.id] = areaItem;
                this.view.addChild(areaItem);
                areaItem.node.name = `area_${cfg.id}`;
            }
            areaItem.visible = GIns.miniMapMgr.isBuildingShow(cfg.id);
            // areaItem.node.setPosition(iconItem.node.position);
            areaItem.setData(cfg.id, this._mapCfg, this.view.map)
        }
    }

    /**更新*/
    protected updateBuildingIcon(iconItem: MiniMapIconItem, cfg: table.map.MapBuildingConfig): void {
        if (cfg.building_type == MapObjectType.factories || cfg.building_type == MapObjectType.mine) {
            //工厂和矿场需要显示占领情况
            let trunkCfg = GIns.miniMapMgr.getBuildingTrunkCfg(cfg.building_type);
            let buildingVo = GIns.leagueExploreModel.getBuildingVo(cfg.id);
            if (buildingVo) {
                let state = GIns.leagueExploreModel.getBuildingOccupyState(buildingVo);
                if (state == LeaugeExploreBuildingOccupyState.Me
                    || state == LeaugeExploreBuildingOccupyState.MyLeagueCanExchange
                    || state == LeaugeExploreBuildingOccupyState.MyLeagueNoExchange
                    || state == LeaugeExploreBuildingOccupyState.MyLeagueNoFull) {
                    iconItem.setIcon(trunkCfg.myOccupyIconPath);
                } else if (state == LeaugeExploreBuildingOccupyState.Enemy) {
                    iconItem.setIcon(trunkCfg.otherOccupyIconPath);
                } else {
                    iconItem.setIcon(GIns.miniMapMgr.getBuildingIcon(cfg.building_type, cfg.id));
                }
                iconItem.setLv(cfg.building_type == MapObjectType.factories ? buildingVo.cfg.level : 0);
                return
            }
        }
        iconItem.setIcon(GIns.miniMapMgr.getBuildingIcon(cfg.building_type, cfg.id));
    }

    //资源点, bossIcon
    private setResourcePoint(id?: number) {
        if (id) {
            let cfg = TableManager.getDataById(table.map.MapMonsterConfig, id);
            this.setResourcePointIcon(cfg);
        } else {
            let cfgs = GIns.miniMapMgr.getResourceCfgs();
            for (let cfg of cfgs) {
                this.setResourcePointIcon(cfg);
            }
        }
    }

    //设置资源点图标
    public setResourcePointIcon(cfg: table.map.MapMonsterConfig) {
        if (!cfg) return;
        let id = GIns.miniMapMgr.getResourceIdByMonsterId(cfg.id);
        let pos = MapResourceController.ins().getWorldResourcePosByResoucreId(id);
        if (cfg && pos) {
            let iconItem: MiniMapIconItem;
            if (this._buildingMap[cfg.id]) {
                iconItem = this._buildingMap[cfg.id];
            } else {
                iconItem = this.createBuildingIcon();
                this._buildingMap[cfg.id] = iconItem;
                this.view.addChild(iconItem);
                iconItem.node.name = `${cfg.id}`;
                iconItem.setIcon(GIns.miniMapMgr.getBuildingIcon(cfg.monsterType, cfg.id));
            }
            iconItem.visible = false;
            iconItem.visible = true;
            let x = pos.x / this._mapCfg.scale[0] + this.view.map.x - this._mapCfg.offset[0];
            let y = this.view.map.height - pos.y / this._mapCfg.scale[1] + this.view.map.y + this._mapCfg.offset[1];
            iconItem.node.setPosition(x, -y);

            iconItem.setScale(this._iconScale, this._iconScale);
        }
    }

    /** 播放动画 */
    private playAnim(iconItem: MiniMapIconItem, cfg: table.map.MapBuildingConfig) {
        iconItem.hideArrowIcon();
        if (GIns.miniMapMgr.getBuildingIsAnim(cfg.building_type) && this._isShowPlayer) {
            switch (GIns.miniMapMgr.getBuildingAnimType(cfg.building_type)) {
                case 1:
                    iconItem.floatUpDown(0.5);
                    break;
                case 2:
                    if (MapManager.ins().getBuildingUnlockById(cfg.id)) {
                        iconItem.setArrowIcon("image/smallMap/xdt_016");
                        iconItem.floatArrow(0.5);
                    }
                    break;
            }
        }
    }

    //玩家位置
    public playerPos() {
        if (!this._mapCfg.scale) return;
        if (!this._isShowPlayer) return;
        let id = -1;
        let iconItem: MiniMapIconItem;
        if (this._buildingMap[id]) {
            iconItem = this._buildingMap[id];
        } else {
            iconItem = this.createBuildingIcon();
            this._buildingMap[id] = iconItem;
            iconItem.node.name = `玩家位置`;
            this.view.addChild(iconItem);
            iconItem.setIcon("image/smallMap/xdt_013");
        }
        iconItem.visible = true;
        let pos = MapManager.ins().getMapPos();
        let x = pos.x / this._mapCfg.scale[0] + this.view.map.x - this._mapCfg.offset[0];
        let y = this.view.map.height - pos.y / this._mapCfg.scale[1] + this.view.map.y + this._mapCfg.offset[1];
        iconItem.node.setPosition(x, -y);
        iconItem.setScale(this._iconScale, this._iconScale);
        iconItem.floatUpDown(0.5);
    }

    /** 设置小地图位置 */
    setMiniMapPosition(pos: { x: number; y: number }) {
        if (!this._mapCfg || !this._mapCfg.scale) return;
        this.view.map.x = 0;
        this.view.map.y = 0;
        let posX = this._mapCfg.offset[0] - pos.x / this._mapCfg.scale[0];
        let posY = this._mapCfg.offset[1] - (this.view.map.height - pos.y / this._mapCfg.scale[1]);
        this.view.map.setPosition(posX, posY);
        // if (this._mapCfg.offset) {
        //     this.view.map.x += this._mapCfg.offset[0];
        //     this.view.map.y -= this._mapCfg.offset[1];
        // }
        this.setMiniMapIcon();
    }

    /** 图标缩放值 */
    iconScale(value: number) {
        value = value * 0.5;
        this._iconScale = value > 1 ? 1 / value : value;
        this.setMiniMapIcon();
    }

    /** 给建筑图标添加点击事件 */
    public setBuildingIconClick(iconItem: MiniMapIconItem, cfg: table.map.MapBuildingConfig) {
        let self = this;
        switch (cfg.building_type) {
            case MapObjectType.TELEPORT:
                if (MapManager.ins().getBuildingUnlockById(cfg.id)) {
                    iconItem.bindClickEvent(self.onClickItem.bind(self, cfg));
                }
                break;
        }
    }

    /** 传送阵图标点击事件 */
    private onClickItem(cfg: table.map.MapBuildingConfig) {
        G.UIManager.open(UICommonKey.BtnConfirmView, {
            title: CommonI18nKeys.tipsForConfirm,
            content: `是否传送至“${cfg.maparea_name}”`,
            titleConfirm: CommonI18nKeys.confirm,
            titleCancel: CommonI18nKeys.cancel,
            onBtnYes: () => {
                UIManager.ins().open(UICommonKey.TransferAnimWin, { curBuildingId: null, transferBuildingId: cfg.id });
                G.UIManager.close(UIMiniMapKey.MiniMapMainView);
            },
        } as BtnConfirmViewOpenArgs);
    }

    @LogBusiness("调整各个小地图位置")
    private adjustMinMapPos() {
        let len = this._mapIcons.length;
        for (let i = 0; i < len; ++i) {
            let miniMap = this._mapIcons[i];
            if (miniMap.visible == false) {
                break;
            }
            miniMap.y += this._offsetY;
        }
    }

    @LogBusiness("拼接地图尺寸改变，重新计算地图尺寸")
    private onMapSizeChg() {
        //拼接的地图大小改变，要重新计算合成地图大小，不然小地图显示的位置就不对
        this.view.map.ensureBoundsCorrect();
    }
}
