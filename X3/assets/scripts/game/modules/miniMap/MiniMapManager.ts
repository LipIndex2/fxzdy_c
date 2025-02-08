import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { TableManager } from "../../../core/table/TableManager";
import { StringUtils } from "../../../core/utils/StringUtils";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { MapObjectType } from "../../tiledMap/MapEnum";
import { MapManager } from "../../tiledMap/MapManager";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { ConditionManager } from "../condition/ConditionManager";
import { FloatingTextManager } from "../floatingText/FloatingTextManager";

/**
 * 小地图
 * 星球收集
 */
export class MiniMapManager extends BaseSingleton {
    /** 星球表 */
    private _mapStarCfg: table.map.TrunkMapStarConfig[];
    /** 章节表 */
    private _mapChapterCfg: table.map.ChapterConfig[];
    /** 章节任务表 */
    private _mapChapterTaskCfg: table.map.TrunkMapTaskConfig[];
    /** 建筑类型表 */
    private _mapBuildingTypeCfg: table.map.TrunkMapBuildingConfig[];
    /** 建筑类型表 */
    private _mapBuildingTypeCfgForTypeMap: Map<string, table.map.TrunkMapBuildingConfig>;
    /** 怪物表 */
    private _mapMonsterCfgs: table.map.MapMonsterConfig[];
    /** 资源点表 */
    private _mapResourceCfgs: table.map.MapResourceConfig[];

    /** 主线地图信息 */
    private _mapInfoVos: Vo.map.TrunkMapInfoVo[];
    /** 地图任务信息 */
    private _mapTaskInfoVo: Vo.task.TaskInfoVo;

    /**
     * 已提示资源限制的章节ID列表
     */
    private _resourceLimitTipChapterIds: Array<number>;

    // 初始化时
    protected onInit(): void {
        if (this._mapBuildingTypeCfgForTypeMap == null) {
            this._mapBuildingTypeCfgForTypeMap = new Map();
            this._mapBuildingTypeCfg = TableManager.getAllData(table.map.TrunkMapBuildingConfig);
            this._mapBuildingTypeCfg?.forEach((value) => {
                this._mapBuildingTypeCfgForTypeMap.set(value.building_type, value);
            })
        }
    };

    /** ========================================所有配置================================================= */
    //---------------------------收集-----------------------------
    /** 所有星球配置 */
    public get MapStarCfg(): table.map.TrunkMapStarConfig[] {
        if (!this._mapStarCfg) this._mapStarCfg = TableManager.getAllData(table.map.TrunkMapStarConfig);
        return this._mapStarCfg;
    }
    /** 所有章节配置 */
    public get MapChapterCfg(): table.map.ChapterConfig[] {
        if (!this._mapChapterCfg) this._mapChapterCfg = TableManager.getAllData(table.map.ChapterConfig);
        return this._mapChapterCfg;
    }
    /** 所有任务配置 */
    public get MapChapterTaskCfg(): table.map.TrunkMapTaskConfig[] {
        if (!this._mapChapterTaskCfg) this._mapChapterTaskCfg = TableManager.getAllData(table.map.TrunkMapTaskConfig);
        return this._mapChapterTaskCfg;
    }
    //---------------------------小地图-----------------------------
    /** 所有建筑类型配置 */
    public get MapBuildingTypeCfg(): table.map.TrunkMapBuildingConfig[] {
        if (!this._mapBuildingTypeCfg) this._mapBuildingTypeCfg = TableManager.getAllData(table.map.TrunkMapBuildingConfig);
        return this._mapBuildingTypeCfg;
    }
    /** 所有怪物表配置 */
    public get MapMonsterCfgs(): table.map.MapMonsterConfig[] {
        if (!this._mapMonsterCfgs) this._mapMonsterCfgs = TableManager.getAllData(table.map.MapMonsterConfig);
        return this._mapMonsterCfgs;
    }
    /** 所有资源点表配置 */
    public get MapResourceCfgs(): table.map.MapResourceConfig[] {
        if (!this._mapResourceCfgs) this._mapResourceCfgs = TableManager.getAllData(table.map.MapResourceConfig);
        return this._mapResourceCfgs;
    }

    /** ========================================当前配置================================================= */
    /** 当前星球id, 可能为空，为空不显示星球收集 */
    public get MapStarId(): number {
        let mapCfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        return mapCfg?.starId;
    }
    /** 当前星球配置 */
    public get MapStarCfgById(): table.map.TrunkMapStarConfig {
        let cfg = TableManager.getDataById(table.map.TrunkMapStarConfig, this.MapStarId);
        return cfg;
    }

    /** 根据星球id获取星球所有任务配置 */
    public MapStarTaskCfgById(id: number): table.map.TrunkMapTaskConfig[] {
        let cfgs: table.map.TrunkMapTaskConfig[] = [];
        for (let cfg2 of this.MapChapterTaskCfg) {
            if (id == cfg2.starId) {
                cfgs.push(cfg2);
            }
        }
        return cfgs;
    }
    /** 根据星球id获取星球章节配置 */
    public MapChapterCfgById(id: number): table.map.ChapterConfig[] {
        let cfgs: table.map.ChapterConfig[] = [];
        for (let cfg of this.MapChapterCfg) {
            if (cfg.starId == id) {
                cfgs.push(cfg);
            }
        }
        return cfgs;
    }

    /** ======================================================================================== */

    /**
     * 获取星球可获取的总资源Map
     * @param id 星球id
     * @param isTotal 是否获取总资源(未解锁也算上)
     */
    public getStarResourceMap(id: number, isTotal: boolean = false): { [key: string]: number } {
        if (!this.MapStarCfgById) return;
        let map = {};
        //星球初始资源
        for (let i = 0; i < this.MapStarCfgById.resourceLimitRewards.length; i++) {
            let reward = this.MapStarCfgById.resourceLimitRewards[i];
            if (map[reward.k]) {
                map[reward.k] += reward.v;
            } else {
                map[reward.k] = reward.v;
            }
        }
        //章节任务奖励资源上限
        for (let cfg of this.MapChapterCfgById(id)) {
            if (this.isChapterUnlock(cfg.id) || isTotal) {
                for (let i = 0; i < cfg.resourceLimitAdditionRewards.length; i++) {
                    let reward = cfg.resourceLimitAdditionRewards[i];
                    if (map[reward.k]) {
                        map[reward.k] += reward.v;
                    } else {
                        map[reward.k] = reward.v;
                    }
                }
            }
        }
        return map;
    }

    /**
     * 获取所有显示奖励界面星球列表
     */
    public getShowRewardStarList(): table.map.TrunkMapStarConfig[] {
        let cfgs: table.map.TrunkMapStarConfig[] = [];
        for (let cfg of this.MapStarCfg) {
            if (cfg.isShowAwardWin) {
                cfgs.push(cfg);
            }
        }
        return cfgs;
    }

    /**
     * 获取所有未解锁的区域配置表
     * @param id 星球id
     */
    public getUnLockAreaCfgs(id: number): table.map.ChapterConfig[] {
        let cfgs = [];
        for (let cfg of this.MapChapterCfgById(id)) {
            if (!this.isChapterUnlock(cfg.id)) {
                cfgs.push(cfg);
            }
        }
        return cfgs;
    }

    /** 获取当前地图小地图路径 */
    public getMiniMapPath() {
        let path: string = "";
        let mapCfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        if (mapCfg) {
            path = mapCfg.mapPath;
        }
        return path;
    }

    /** 根据地图id获取小地图背景路径 */
    public getMiniMapBgPath() {
        let path: string = "";
        let mapCfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        if (mapCfg) {
            path = mapCfg.mapBGPath;
        }
        return path;
    }

    /** 主线地图信息 */
    public set MapInfoVos(data: Vo.map.TrunkMapInfoVo[]) {
        this._mapInfoVos = data;
    }

    //根据星球id获取主线地图信息Vo
    public getMapInfoVos(starId: number = this.MapStarId): Vo.map.TrunkMapInfoVo {
        for (let info of this._mapInfoVos) {
            if (info.starId == starId) {
                return info;
            }
        }
        return null;
    }

    /** 根据星球id获取主线地图信息Vo*/
    public MapInfoVoByStarId(starId: number = this.MapStarId): Vo.map.TrunkMapInfoVo {
        if (!starId) return;
        let vo: Vo.map.TrunkMapInfoVo = this.getMapInfoVos();
        let map = Object.keys(this.getStarResourceMap(this.MapStarId));
        if (!vo && map?.length > 0) {
            let drawMap = {};
            for (let id of map) {
                drawMap[id] = 0;
            }
            //初始化vo
            vo = {
                starId: starId,
                drawResourceMap: drawMap,
            };
            this._mapInfoVos.push(vo);
        }

        return vo;
    }

    /** 判断章节是否解锁 */
    public isChapterUnlock(id: number): boolean {
        let cfg = TableManager.getDataById(table.map.ChapterConfig, id);
        if (!cfg) return false;
        if (MapManager.ins().getBuildingUnlockById(cfg.building_id)) {
            return true;
        }
        return false;
    }

    private _mapBuildingCfg: table.map.MapBuildingConfig[];

    /** 获取所有需要显示的怪物表 */
    public getResourceCfgs() {
        let cfgs: table.map.MapMonsterConfig[] = [];
        for (let cfg of this.MapMonsterCfgs) {
            if (cfg.smallmap_icon && ConditionManager.ins().checkCondition(cfg.smallmap_icon)) {
                cfgs.push(cfg);
            }
        }
        return cfgs;
    }
    /** 根据怪物表id获取资源点id */
    public getResourceIdByMonsterId(id: number): number {
        for (let cfg of this.MapResourceCfgs) {
            if (cfg.mapMonsterId == id) {
                return cfg.id;
            }
        }
        return 0;
    }

    /** 获取当前地图的建筑 */
    public getBuildingCfgs() {
        if (!this._mapBuildingCfg) this._mapBuildingCfg = TableManager.getAllData(table.map.MapBuildingConfig);
        let cfgs: table.map.MapBuildingConfig[] = [];
        // let mapCfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        for (let cfg of this._mapBuildingCfg) {
            if (cfg.map_id == MapManager.ins().getMapID()) {
                cfgs.push(cfg);
            }
        }
        return cfgs;
    }
    /** 根据id判断显示条件 */
    private isBuildingShowByCondition(buildingId: number) {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        if (!cfg) return 0;
        for (let typeCfg of this.MapBuildingTypeCfg) {
            if (StringUtils.repLeadTrailBlank(cfg.building_type) == StringUtils.repLeadTrailBlank(typeCfg.building_type)) {
                return +typeCfg.showVerify;
            }
        }
        return 0;
    }
    /** 判断建筑是否可以显示 */
    public isBuildingShow(buildingId: number): boolean {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        let isShow = false;

        //0: 不显示; 1: 显示; 2: 根据迷雾区域是否解锁判断; 3 迷雾区域解锁 且 自身未解锁   显示
        switch (this.isBuildingShowByCondition(buildingId)) {
            case 0:
                isShow = false;
                break;
            case 1:
                isShow = true;
                break;
            case 2:
                if (cfg.showInMapVerify) {
                    isShow = MapManager.ins().getBuildingUnlockById(cfg.showInMapVerify);
                } else {
                    isShow = true;
                }
                break;
            case 3:
                if (cfg.showInMapVerify) {
                    isShow = MapManager.ins().getBuildingUnlockById(cfg.showInMapVerify) && !MapManager.ins().getBuildingUnlockById(cfg.id);
                } else {
                    isShow = !MapManager.ins().getBuildingUnlockById(cfg.id);
                }
                break;
        }

        return isShow;
    }

    /**获取建筑小地图配置信息*/
    public getBuildingTrunkCfg(buildingType: MapObjectType | string): table.map.TrunkMapBuildingConfig {
        if (this._mapBuildingTypeCfgForTypeMap.has(buildingType)) {
            return this._mapBuildingTypeCfgForTypeMap.get(buildingType);
        }
        return null;
    }
    /** 获取建筑图标 */
    public getBuildingIcon(type: string, building_id: number): string {
        let cfgs = this.MapBuildingTypeCfg;
        for (let cfg of cfgs) {
            if (cfg.building_type == type) {
                if (type == "instance") {
                    if (GIns.mapInstanceMgr.isPass(building_id)) {
                        return cfg.activeIconPath;
                    } else {
                        return cfg.notActiveIconPath;
                    }
                }

                if (!cfg.isResource && MapManager.ins().getBuildingUnlockById(building_id)) {
                    return cfg.activeIconPath;
                } else {
                    return cfg.notActiveIconPath;
                }
            }
        }
        return "";
    }
    /** 获取图标是否需要动画 */
    public getBuildingIsAnim(type: string): boolean {
        let isShow = false;
        for (let cfg of this.MapBuildingTypeCfg) {
            if (cfg.building_type == type) {
                isShow = cfg.isAnim;
                break;
            }
        }
        return isShow;
    }
    /** 获取图标播放的动画类型 */
    public getBuildingAnimType(type: string) {
        let animType = 1;
        for (let cfg of this.MapBuildingTypeCfg) {
            if (cfg.building_type == type) {
                animType = cfg.animType;
                break;
            }
        }
        return animType;
    }

    /** 当前星球资源获取是否达到上限 */
    public isResourceMax(itemId: number) {
        let starResourceList = this.getStarResourceMap(this.MapStarId);
        if (!starResourceList) return false;
        let max = starResourceList[itemId];
        let num = this.MapInfoVoByStarId(this.MapStarId)?.drawResourceMap[itemId] || 0;
        return num >= max;
    }

    /** 获取当前星球资源量 */
    public getStarResourceNumById(itemId: number) {
        let starResourceList = this.getStarResourceMap(this.MapStarId);
        if (!starResourceList) return 0;
        let num = this.MapInfoVoByStarId(this.MapStarId)?.drawResourceMap[itemId] || 0;
        return num;
    }

    /** 获取当前星球资源上限量 */
    public getStarResourceMaxNumById(itemId: number) {
        let starResourceList = this.getStarResourceMap(this.MapStarId);
        if (!starResourceList) return 0;
        let max = starResourceList[itemId];
        return max;
    }

    //当前区域是否显示过上限提示
    public _isShowMaxResourceTip = false;

    /** ===========================任务============================= */

    /** 地图任务信息 */
    public set MapTaskInfoVo(data: Vo.task.TaskInfoVo) {
        this._mapTaskInfoVo = data;
    }
    public get MapTaskInfoVo(): Vo.task.TaskInfoVo {
        return this._mapTaskInfoVo;
    }

    /** 已提示资源限制的章节ID列表 */
    public set resourceLimitTipChapterIds(data: Array<number>) {
        this._resourceLimitTipChapterIds = data;
    }
    public get resourceLimitTipChapterIds(): Array<number> {
        return this._resourceLimitTipChapterIds;
    }

    /** 获取任务状态 */
    public getTaskState(taskId: number): number {
        for (let taskVo of this.MapTaskInfoVo.currentTasks) {
            if (taskVo.taskId == taskId) {
                return taskVo.state;
            }
        }
    }

    /** 判断任务是否完成(已领取) */
    public isTaskComplete(taskId: number): boolean {
        if (this.MapTaskInfoVo.finishedTaskIds.indexOf(taskId) != -1) {
            return true;
        }
        return false;
    }

    /** 判断任务是否可以领取 */
    public isTaskCanGet(taskId: number) {
        if (this.isTaskComplete(taskId)) return false;
        for (let taskVo of this.MapTaskInfoVo.currentTasks) {
            if (taskVo.taskId == taskId) {
                return taskVo.state == 3;
            }
        }
        return false;
    }

    /** 更新小地图任务 */
    public updateMiniMapTask(data: Vo.task.TaskVo) {
        //TODO
        if (data) {
            for (let taskVo of this.MapTaskInfoVo.currentTasks) {
                if (taskVo.taskId == data.taskId) {
                    taskVo.state = data.state;
                }
            }
        }
        G.FacadeManager.emit(NotificationKey.MAP_TASK_REFRESH);
    }

    // ---------------------------------------------红点---------------------------------------------------------
    /** 刷新小地图红点 */
    public refreshMiniMapRedPoint() {
        G.GameTimer.once(500, this, () => {
            this.refreshStarRedPoint();
            this.refreshTaskRedPoint();
        });
    }

    /** 刷新星球红点 */
    public refreshStarRedPoint() {
        let allStarCfgs = this.MapStarCfg;
        for (let cfg of allStarCfgs) {
            if (cfg) {
                let starTaskCfgs = this.MapStarTaskCfgById(cfg.id);
                let isTrue = false;
                for (let taskCfg of starTaskCfgs) {
                    if (taskCfg && this.isTaskCanGet(taskCfg.id)) {
                        isTrue = this.isTaskCanGet(taskCfg.id);
                        break;
                    }
                }
                GIns.redDotMgr.setRedDot(RedDotKeys.Map_star, isTrue, [cfg.id]);
            }
        }
    }

    /** 刷新任务红点 */
    public refreshTaskRedPoint() {
        let allTaskCfgs = this.MapChapterTaskCfg;
        for (let cfg of allTaskCfgs) {
            if (cfg) {
                GIns.redDotMgr.setRedDot(RedDotKeys.Map_task, this.isTaskCanGet(cfg.id), [cfg.id]);
            }
        }
    }

    /** 判断当前区域是否达到满资源 */
}
