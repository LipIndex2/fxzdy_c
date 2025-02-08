import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { EnumGainNewHeroType } from "db://assets/scripts/game/modules/drawcard/enums/EnumGainNewHeroType";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "../../../core/comm/G";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../core/table/TableManager";
import { NetCacheMgr } from "../../comm/cache/NetCacheMgr";
import NotificationKey from "../../event/NotificationKey";
import { ConditionManager } from "../../modules/condition/ConditionManager";
import { DrawCardUIKeys } from "../../modules/drawcard/DrawCardUIKeys";
import { DrawCardFirstGetItemViewOpenArgs } from "../../modules/drawcard/view/DrawCardFirstGetItemView";
import { FloatingTextManager } from "../../modules/floatingText/FloatingTextManager";
import { IItemRewardParam, ItemRewardFrom } from "../../modules/item/model/vo/IItemRewardParam";
import { ItemUtils } from "../../modules/item/utils/ItemUtils";
import { MapInstanceManager } from "../../modules/mapInstance/MapInstanceManager";
import { MiniMapModule } from "../../modules/miniMap/MiniMapModule";
import { MapObjectType } from "../MapEnum";
import { IMapBossKillData } from "./vo/IMapBossKillData";

/**
 * 地图接口协议号
 * @author GameCreator
 */
export class MapModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 19;

    // <建筑id, 解锁?>
    private _buildingIdToUnlockFlagMap: { [buildingId: number]: boolean } = {};
    private _mapIdToHaveSeeMap: { [mapId: number]: boolean } = {};

    //地图建筑任务
    private buildingTaskInfo: { [taskId in number]: Vo.task.TaskVo } = {};
    private buildingTaskFinished: Set<number> = new Set();

    /**广告宝箱数据*/
    public advertBoxVo: Vo.map.MapMainCityAdvertBoxVo = null;
    protected _firstBossResourceId: number = -1;

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recUnlockBuilding);
        this.registerMsg(moduleId, 2, this.recLoadMapResources);
        this.registerMsg(moduleId, 3, this.recDrawMapResources);
        this.registerMsg(moduleId, 4, this.recLoadChangedMapResources);
        this.registerMsg(moduleId, 5, this.recRebirthTeam);
        this.registerMsg(moduleId, 6, this.recChallengeMapInstance);
        this.registerMsg(moduleId, 7, this.recTeleportEvent);
        this.registerMsg(moduleId, 10, this.recFirstExploreMap);
        this.registerMsg(moduleId, 11, this.recLoadSurvivalMapResources);
        this.registerMsg(moduleId, 12, this.recDrawBoxBuildingAdvertReward);
        this.registerMsg(moduleId, 13, this.recDrawMapBossAdvertReward);
        this.registerMsg(moduleId, 14, this.recFirstReturnMainCity);
        this.registerMsg(moduleId, 15, this.recDrawMainCityAdvertBox);
        this.registerMsg(moduleId, -1, this.pushMapInstanceChallengeResult);
        this.registerMsg(moduleId, -2, this.pushBossSummon);
        this.registerMsg(moduleId, -3, this.pushMainCityAdvertBox);
    }

    /**地图vo */
    public get MapVo(): { [buildingId: number]: boolean } {
        return this._buildingIdToUnlockFlagMap;
    }

    /**首个boss的资源id*/
    public get firstBossResourceId(): number {
        if (this._firstBossResourceId < 0) {
            let cfg = G.TableManager.getDataById(table.map.MapConstantConfig, "MAP:FIRST_BOSS_RESOURCE_ID");
            if (cfg) {
                this._firstBossResourceId = Number(cfg.content);
            } else {
                this._firstBossResourceId = 0;
            }
        }
        return this._firstBossResourceId;
    }

    @LogBusiness("[初始化地图数据]")
    public initData(vo: Vo.map.MapLoginVo): void {
        if (vo) {
            for (let num of vo.unlockedBuildingIds || []) {
                this._buildingIdToUnlockFlagMap[num] = true;
            }
            if (vo.exploreMapIds) {
                for (let n of vo.exploreMapIds || []) {
                    this._mapIdToHaveSeeMap[n] = true;
                }
            }
            this.advertBoxVo = vo.mapMainCityAdvertBoxVo;
            //副本 boss
            MapInstanceManager.ins().initData(vo.passMapInstanceIds);

            MiniMapModule.ins().initData(vo);

            //地图建筑任务
            if (vo.buildingTaskInfo) {
                this.buildingTaskInfo = {};
                vo.buildingTaskInfo.currentTasks.forEach(v => {
                    this.buildingTaskInfo[v.taskId] = v;
                })
                this.buildingTaskFinished = new Set(vo.buildingTaskInfo.finishedTaskIds);
            }
        }
    }

    /** 根据建筑id查看是否解锁 */
    public getBuildingUnlockById(buildingId: number): boolean {
        let ret = this.MapVo && (this.MapVo[buildingId] || false);
        if (!ret) {
            let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
            ret = cfg && cfg.autoOpen && ConditionManager.ins().checkCondition(cfg.openVerify);
        }
        return ret;
    }

    /**获取解锁条件 */
    public getBuildingUnlockCondition(buildingId: number): string {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        let openTips = cfg && ConditionManager.ins().getOpenConditionTips(cfg.openVerify);
        return openTips;
    }

    /*********************************协议发送*********************************/

    /**
     * 解锁建筑
     * 模块号：19	指令号：1
     */
    public sendUnlockBuilding(buildingId: number): void {
        let c2s = {} as Vo.map.UnlockBuildingC2S;
        c2s.buildingId = buildingId;
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 获取地图资源点信息
     * 模块号：19	指令号：2
     */
    public sendLoadMapResources(ids: number[]): void {
        let c2s = {} as Vo.map.LoadMapResourcesC2S;
        c2s.mapResourceConfigIds = ids;
        this.send(this.MODULE, 2, c2s);
    }

    /**
     * 采集/领取地图资源点
     * 模块号：19	指令号：3
     */
    public sendDrawMapResources(vos: Array<Vo.map.MapResourceDrawReqVo>): void {
        let c2s = {} as Vo.map.DrawMapResourcesC2S;
        c2s.reqVos = vos;
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /**
     * 更新资源点数据
     * 模块号：19	指令号：4
     * @param ids  资源点Id
     */
    public sendLoadChangedMapResources(ids: number[]): void {
        let c2s = {} as Vo.map.LoadChangedMapResourcesC2S;
        c2s.mapResourceConfigIds = ids;
        this.send(this.MODULE, 4, c2s);
    }

    /**
     * 复活队伍
     * 模块号：19	指令号：5
     */
    public sendRebirthTeam(): void {
        this.send(this.MODULE, 5);
    }

    /**
     * 挑战地图副本
     * 模块号：19	指令号：6
     */
    public sendChallengeMapInstance(mapInstanceId: number): void {
        let c2s = {} as Vo.map.ChallengeMapInstanceC2S;
        c2s.mapInstanceId = mapInstanceId;
        this.send(this.MODULE, 6, c2s);
    }

    /**
     * 主线地图传送事件,目标传送点TeleportlistConfig.taskTeleport为true请求此接口
     * 模块号：19	指令号：7
     */
    public sendTeleportEvent(targetTeleportId: number): void {
        let c2s = {} as Vo.map.TeleportEventC2S;
        c2s.targetTeleportId = targetTeleportId;
        this.send(this.MODULE, 7, c2s);
    }

    /**
     * 首次探索地图
     * 模块号：19	指令号：10
     */
    public sendFirstExploreMap(c2s: Vo.map.FirstExploreMapC2S): void {
        this.send(this.MODULE, 10, c2s, c2s);
    }

    /**
     * 获取有存活资源的资源点
     * 模块号：19	指令号：11
     * (不建议写callback， 这里业务特殊)
     */
    public sendLoadSurvivalMapResources(resourceId: number[], callback: Function): void {
        let c2s = {} as Vo.map.LoadSurvivalMapResourcesC2S;
        c2s.mapResourceConfigIds = resourceId;

        let cache = NetCacheMgr.ins().get("LoadSurvivalMapResources", 5000);
        if (cache) {
            callback && callback(cache);
            return;
        }

        this.send(this.MODULE, 11, c2s, callback);
    }

    /**
     * 领取地图宝箱奖励广告奖励
     * 模块号：19	指令号：12
     */
    public sendDrawBoxBuildingAdvertReward(c2s: Vo.map.DrawBoxBuildingAdvertRewardC2S, param: IItemRewardParam): void {
        this.send(this.MODULE, 12, c2s, param);
    }

    /**
     * 领取地图BOSS奖励广告奖励
     * 模块号：19	指令号：13
     */
    public sendDrawMapBossAdvertReward(c2s: Vo.map.DrawMapBossAdvertRewardC2S): void {
        this.send(this.MODULE, 13, c2s);
    }

    /**
     * 首次返回主城
     * 模块号：19	指令号：14
     */
    public sendFirstReturnMainCity(): void {
        this.send(this.MODULE, 14);
    }

    /**
     * 领取主城广告宝箱
     * 模块号：19	指令号：15
     */
    public sendDrawMainCityAdvertBox(): void {
        this.send(this.MODULE, 15);
    }

    /*********************************协议监听*********************************/

    /**
     * 解锁建筑
     * 模块号：19	指令号：1
     */
    public recUnlockBuilding(data: Vo.map.UnlockBuildingS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            for (let id of data.content.unlockBuildingIds) {
                let cfg: table.map.MapBuildingConfig = TableManager.getDataById(table.map.MapBuildingConfig, id);
                if (cfg.building_type == MapObjectType.MIST_UNLOCKED) {
                    //迷雾
                    FacadeManager.ins().emit(NotificationKey.MAP_MIST_UNLOCKED, id);
                } else {
                    //其他建筑
                    FacadeManager.ins().emit(NotificationKey.MAP_BUILDING_UNLOCK, id);
                }
                if (cfg.unlockTips) {
                    //解锁关联建筑时会连续飘两次提示,加个延迟防止连续两次提示
                    G.GameTimer.once(200, this, () => {
                        FloatingTextManager.ins().showTips(cfg.unlockTips);
                    });
                }

                this._buildingIdToUnlockFlagMap[id] = true;
            }

            if (data.content.rewardResults) {
                let rewards = [];
                for (let reward of data.content.rewardResults) {
                    if (reward && reward.baseId) {
                        let item = ItemUtils.getItemConfigByItemId(reward.baseId);
                        if (ServerEnums.ItemType[item.type] == ServerEnums.ItemType.HERO_CARD) {
                            // 打开新获得英雄界面
                            G.UIManager.open(DrawCardUIKeys.DrawCardFirstGetItemView, DrawCardFirstGetItemViewOpenArgs.create(item.id, EnumGainNewHeroType.REWARD));
                            // 获得道具, 不弹出
                            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.content.rewardResults);
                        } else {
                            rewards.push(reward);
                        }
                    }
                }

                let buildingCfg = TableManager.getDataById(table.map.MapBuildingConfig, data.content.unlockBuildingIds[0]);
                if (
                    buildingCfg.building_type == MapObjectType.box ||
                    buildingCfg.building_type == MapObjectType.box_mid ||
                    buildingCfg.building_type == MapObjectType.box_max
                ) {
                    // 获得道具, 强制弹出恭喜获得
                    let param: IItemRewardParam = {
                        rewards: rewards,
                        from: ItemRewardFrom.MAP_BOX,
                        extra: data.content.unlockBuildingIds[0],
                    };
                    FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW_WITH_PARAM, param);
                } else {
                    // 获得道具动画, 宝箱类建筑
                    this.emit(NotificationKey.EVENT_GET_ITEM_ANIM, { items: rewards, buildingId: data.content.unlockBuildingIds[0], isShowItemNumEffect: true });
                    // 获得道具, 不弹出
                    FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewards);
                }
            }

            // 消耗
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
        }
    }

    /**
     * 获取地图资源点信息
     * 模块号：19	指令号：2
     */
    public recLoadMapResources(data: Vo.map.LoadMapResourcesS2C): void {
        if (data.code >= 0) {
            // console.log(data);
            if (data.content?.length) {
                this.emit(NotificationKey.MAP_RESOURCE_REFRESH_UPDATE, data.content);
            }
        }
    }

    /**
     * 采集/领取地图资源点
     * 模块号：19	指令号：3
     */
    public recDrawMapResources(data: Vo.map.DrawMapResourcesS2C, c2s: Vo.map.DrawMapResourcesC2S): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data.content?.resourceNextRefreshTimeMap) {
                this.emit(NotificationKey.RESOURCE_REFRESH_TIME_UPDATE, data.content.resourceNextRefreshTimeMap);
            }
            if (data.content?.rewardResults?.length) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.content.rewardResults);
                this.emit(NotificationKey.MAP_COLLECT_RESOURCE, data.content.rewardResults);
            }
            if (data.content?.bossRewardResults) {
                //找到boss对应的资源id
                let args: Map<number, IMapBossKillData> = new Map();
                for (let key in data.content?.bossRewardResults) {
                    let monsterId = Number(key);

                    if (monsterId) {
                        let killData: IMapBossKillData = {
                            rewards: data.content?.bossRewardResults[key],
                            resourceId: 0,
                        };
                        for (let i = 0; i < c2s?.reqVos.length; i++) {
                            let resourceCfg = G.TableManager.getDataById(table.map.MapResourceConfig, c2s?.reqVos[i].mapResourceConfigId);
                            if (resourceCfg && resourceCfg.mapMonsterId == monsterId) {
                                killData.resourceId = resourceCfg.id;
                                break;
                            }
                        }
                        args.set(monsterId, killData);
                    }
                    if (key) {
                        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.content.bossRewardResults[key]);
                    }
                }
                this.emit(NotificationKey.BOOS_FIRST_KILL, args);
            }
        }
    }

    /**
     * 更新资源点数据
     * 模块号：19	指令号：4
     */
    public recLoadChangedMapResources(data: Vo.map.LoadChangedMapResourcesS2C): void {
        if (data.code >= 0) {
            // console.log(data);
            if (data.content?.length) {
                this.emit(NotificationKey.MAP_RESOURCE_REFRESH_UPDATE, data.content);
            }
        }
    }

    /**
     * 复活队伍
     * 模块号：19	指令号：5
     */
    public recRebirthTeam(data: Vo.map.RebirthTeamS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data?.content) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content as Array<Vo.cost.CostItemResult>);
                this.emit(NotificationKey.TEAM_REBIRTH);
            }
        }
    }

    /**
     * 挑战地图副本
     * 模块号：19	指令号：6
     */
    public recChallengeMapInstance(data: Vo.map.ChallengeMapInstanceS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 主线地图传送事件,目标传送点TeleportlistConfig.taskTeleport为true请求此接口
     * 模块号：19	指令号：7
     */
    public recTeleportEvent(data: Vo.map.TeleportEventS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 首次探索地图
     * 模块号：19	指令号：10
     */
    public recFirstExploreMap(data: Vo.map.FirstExploreMapS2C, c2s: Vo.map.FirstExploreMapC2S): void {
        if (data.code < 0) {
            return;
        }
        const mapId = c2s.mapId;

        if (this._mapIdToHaveSeeMap[mapId] == true) {
            return;
        }

        this._mapIdToHaveSeeMap[mapId] = true;
        this.emit(NotificationKey.SEE_NEW_MAP, mapId);
    }

    /**
     * 获取有存活资源的资源点
     * 模块号：19	指令号：11
     */
    public recLoadSurvivalMapResources(data: Vo.map.LoadSurvivalMapResourcesS2C, callback: Function): void {
        if (data.code >= 0) {
            if (data.content) {
                let arr = [data.content]; //第一个有资源的点
                NetCacheMgr.ins().save("LoadSurvivalMapResources", arr);
                callback && callback(arr);
            }
        }
    }

    /**
     * 领取地图宝箱奖励广告奖励
     * 模块号：19	指令号：12
     */
    public recDrawBoxBuildingAdvertReward(data: Vo.map.DrawBoxBuildingAdvertRewardS2C, param: IItemRewardParam): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            //需要先关闭上一个奖励界面
            this.emit(NotificationKey.AD_GET_REWARD_COMPLETE, ServerEnums.AdvertType.TRUNK_MAP_BOX_DOUBLE_REWARD);
            if (data.content?.rewardResults?.length > 0) {
                param.rewards = data.content.rewardResults;
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW_WITH_PARAM, param);
            }
        }
    }

    /**
     * 领取地图BOSS奖励广告奖励
     * 模块号：19	指令号：13
     */
    public recDrawMapBossAdvertReward(data: Vo.map.DrawMapBossAdvertRewardS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data.content?.rewardResults?.length > 0) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
            }
            this.emit(NotificationKey.AD_GET_REWARD_COMPLETE, ServerEnums.AdvertType.TRUNK_MAP_BOSS_EXTRA_REWARD);
        }
    }

    /**
     * 首次返回主城
     * 模块号：19	指令号：14
     */
    public recFirstReturnMainCity(data: Vo.map.FirstReturnMainCityS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 领取主城广告宝箱
     * 模块号：19	指令号：15
     */
    public recDrawMainCityAdvertBox(data: Vo.map.DrawMainCityAdvertBoxS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            this.advertBoxVo = data.content.advertBoxVo;
            this.emit(NotificationKey.MAP_AD_BOX_REFRESH);
            if (data.content?.rewardResults?.length > 0) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
            }
            this.emit(NotificationKey.AD_GET_REWARD_COMPLETE, ServerEnums.AdvertType.MAIN_CITY_RANDOM_BOX_REWARD);
        }
    }

    /*********************************协议推送*********************************/

    /**
     * 推送地图副本挑战结果,MapInstanceChallengeVo
     * 模块号：19	指令号：-1
     */
    public pushMapInstanceChallengeResult(data: Vo.map.MapInstanceChallengeVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        if (data.rewardResults) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.rewardResults);
        }
        this.emit(NotificationKey.MAP_INSTANCE_CHALLENGE_RESULT, data);
    }

    /**
     * 推送地图副本BOSS召唤
     * 模块号：19	指令号：-2
     */
    public pushBossSummon(): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        this.emit(NotificationKey.MAP_INSTANCE_UPDATE_BOSS);
        this.emit(NotificationKey.BATTLE_CLEAN_DEFENDER_UNITS);
    }

    /**
     * 推送主城广告宝箱信息,MapMainCityAdvertBoxVo
     * 模块号：19	指令号：-3
     */
    public pushMainCityAdvertBox(data: Vo.map.MapMainCityAdvertBoxVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        this.advertBoxVo = data;
        this.emit(NotificationKey.MAP_AD_BOX_REFRESH);
    }

    /**
     * 推送地图建筑任务
     */
    public pushBuildingTask(changedTask: Vo.task.TaskVo) {
        this.buildingTaskInfo[changedTask.taskId] = changedTask;
        if (changedTask.state == ServerEnums.TaskState.FINISHED) {
            this.buildingTaskFinished.add(changedTask.taskId)
        }

        this.emit(NotificationKey.MAP_BUILDING_TASK_CHG, changedTask.taskId);
    }

    // -------------------------- 业务 -------------------------

    /**
     * 是否解锁了建筑
     * @param buildingId
     */
    isUnlockBuildingById(buildingId: number): boolean {
        return this._buildingIdToUnlockFlagMap[buildingId] || false;
    }

    // 是否探索过地图
    isHaveSeeMap(mapId: number): boolean {
        return this._mapIdToHaveSeeMap[mapId] || false;
    }

    /** 获取地图建筑任务状态 */
    getMapBuildingTaskState(taskId: number): ServerEnums.TaskState {
        let taskInfo = this.buildingTaskInfo[taskId];
        if (taskInfo) {
            return taskInfo.state;
        }
        return ServerEnums.TaskState.IN_PROGRESS;
    }

    /** 获取地图建筑任务进度 */
    getMapBuildingTaskProgress(taskId: number) {
        let taskInfo = this.buildingTaskInfo[taskId];
        if (taskInfo) {
            return taskInfo.progress;
        }
        return 0;
    }

    /** 是否已领取地图建筑任务奖励 */
    isMapBuildingTaskDrawReward(taskId: number) {
        return this.buildingTaskFinished.has(taskId);
    }
}
