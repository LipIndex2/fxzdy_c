import G from "../../../core/comm/G";
import { LogBusiness } from "../../../core/log/LogBusiness";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import GIns from "../../GIns";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { UICollectionsKey } from "./const/UICollectionsConfig";
import { CollectionContext } from "./vo/CollectionContext";

declare global {
    namespace XJ {
        namespace collections {
            interface IActiveSetParam {
                suidCfgId: number
                newActiveStar?: number[] //新激活的星级特效，0表示激活套装，其他数字代表指定的星数特效被激活
            }

            interface IS2CUpStarParam {
                collectionCfgId: number
            }

            interface IS2CUpLVParam {
                collectionCfgId: number
            }

        }
    }
}

interface IActiveSuitCustomData {
    AllActiveSuitStar: number[] //之前激活的星级
}

/**
 * 收藏品模块
 * @author GameCreator
 */
export class CollectionsModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 55

    // /** 所有收藏品配置，key：收藏品id */
    // private allCollectionsCfg: Map<number, table.collectibles.CollectiblesConfig>
    // /** key 收藏品碎片id，value收藏品id */
    // private collFragementId2CollId: Map<number, number>
    /** 所有的收藏品碎片id */
    // private allCollectionFragment: Set<number>

    /**所有碎片对应配置id*/
    protected _allFragmentToIdMap: Map<number, number> = new Map();
    /**所有消耗相关道具id*/
    protected _allCostItemMap: Map<number, boolean> = new Map();

    get context() {
        return this._context;
    }

    private _context: CollectionContext;

    constructor() {
        super();
        this.regist();
        this._context = new CollectionContext();
        // this.allCollectionsCfg = new Map();
        // this.collFragementId2CollId = new Map();
        // G.TableManager.getAllData(table.collectibles.CollectiblesConfig).forEach(n => {
        //     this.collFragementId2CollId.set(n.fragmentItemId, n.id);
        //     this.allCollectionsCfg.set(n.id, n);
        // });
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // 注册所有的服务器消息指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recActive);
        this.registerMsg(moduleId, 2, this.recUpStar);
        this.registerMsg(moduleId, 3, this.recUpLevel);
        this.registerMsg(moduleId, 4, this.recActiveSuit);
        this.registerMsg(moduleId, -1, this.pushExpiredVoList);
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS2,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        let allCollectionsCfg = GIns.collectionsCfgMgr.allCollectionsCfg
        switch (event) {
            case NotificationKey.EVENT_CHANGE_ITEMS2: {
                let param = args as Array<Vo.reward.RewardResult>;

                let newGetCollectionsId = param.filter(n => {
                    if (allCollectionsCfg.has(n.baseId) == false) return false;
                    let collVo = this.context.getCollectionById(n.baseId);
                    return !collVo || !collVo.active;
                }).map(n => {
                    //处理自动激活收藏品
                    this.context._recItemActive(n.contents as any);

                    return n.baseId;
                });
                if (newGetCollectionsId.length > 0){
                    this.showFirstGetCollectionWin(newGetCollectionsId);
                    this.floatFightUpAni();
                }
                break;
            }
        }
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    public get allFragmentToIdMap(): Map<number, number> {
        return this._allFragmentToIdMap;
    }

    public get allCostItemMap(): Map<number, boolean> {
        return this._allCostItemMap
    }

    @LogBusiness("初始化收藏品登录数据")
    initData(collectionsInitVo: Vo.collectibles.CollectiblesLoginVo) {
        this.context.initData(collectionsInitVo);
        GIns.itemModel.backpackContext.addInitDataByCollection(collectionsInitVo.collectiblesVoList);

        //初始化所有消耗配置
        if (this._allFragmentToIdMap.size <= 0) {
            let allCfgs = G.TableManager.getAllData(table.collectibles.CollectiblesConfig);
            allCfgs?.forEach((cfg) => {
                this._allFragmentToIdMap.set(cfg.fragmentItemId, cfg.id);
            })

            let allLevelCfgs = G.TableManager.getAllData(table.collectibles.CollectiblesLevelConfig);
            allLevelCfgs?.forEach((cfg) => {
                cfg.costItems?.forEach((value) => {
                    this._allCostItemMap.set(value.k, true);
                })
            })
        }
    }

    // region 发送协议===========================================================================
    /**
     * 激活
     * 模块号：55	指令号：1
     */
    active(baseId: number) {
        let C2SData: Vo.collectibles.ActiveC2S = {
            baseId: baseId,
        }
        this.send(this.MODULE, 1, C2SData);
    }

    /**
     * 升星
     * 模块号：55	指令号：2
     */
    upStar(collectionCfgId: number) {
        let C2SData: Vo.collectibles.UpStarC2S = {
            baseId: collectionCfgId,
        }
        this.send(this.MODULE, 2, C2SData);
    }

    /**
     * 升级
     * 模块号：55	指令号：3
     */
    upLevel(collectionCfgId: number) {
        let C2SData: Vo.collectibles.UpLevelC2S = {
            baseId: collectionCfgId
        };
        this.send(this.MODULE, 3, C2SData);
    }

    /**
     * 激活套装
     * 模块号：55	指令号：4
     */
    activeSuit(suitId) {
        let C2SData: Vo.collectibles.ActiveSuitC2S = {
            suitId: suitId
        }

        let customData: IActiveSuitCustomData = {
            AllActiveSuitStar: GIns.collectionsModel.context.getAllActiveSuitStar(suitId)
        }
        this.send(this.MODULE, 4, C2SData, customData);
    }


    // region 收到协议===========================================================================
    /**
     * 激活
     * 模块号：55	指令号：1
     */
    recActive(data: Vo.collectibles.ActiveS2C) {
        if (data.code < 0) {
            return;
        }

        let content = data.content;
        GIns.collectionsModel.context._recActive(data)
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, content.rewardResults)
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, content.costItemResults)
        this.emit(NotificationKey.COLLECTIONS_ACTIVE);

        let newGetCollectionIds = content.rewardResults.filter(v => {
            return G.TableManager.getDataById(table.collectibles.CollectiblesConfig, v.baseId);
        }).map(n => {
            return n.baseId;
        });
        this.showFirstGetCollectionWin(newGetCollectionIds);
        this.floatFightUpAni();
    }

    /**
     * 升星
     * 模块号：55	指令号：2
     */
    recUpStar(data: Vo.collectibles.UpStarS2C) {
        if (data.code < 0) {
            return;
        }

        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
        GIns.collectionsModel.context._recUpStar(data);

        let param: XJ.collections.IS2CUpStarParam = {
            collectionCfgId: data.content.collectiblesVo.baseId
        };
        this.emit(NotificationKey.COLLECTIONS_UP_STAR, param);

        let upTipWinParam: XJ.collections.IUpTipsWinViewParam = {
            collectionCfgId: data.content.collectiblesVo.baseId,
        };
        G.UIManager.open(UICollectionsKey.UP_TIP_WIN, upTipWinParam);

        this.emit(NotificationKey.COLLECTIONS_EQUIP_COLL_CHG);
        this.floatFightUpAni();
    }

    /**
     * 升级
     * 模块号：55	指令号：3
     */
    recUpLevel(data: Vo.collectibles.UpLevelS2C) {
        if (data.code < 0) {
            return;
        }

        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
        GIns.collectionsModel.context._recUpLevel(data);

        let param: XJ.collections.IS2CUpLVParam = {
            collectionCfgId: data.content.collectiblesVo.baseId
        };
        this.emit(NotificationKey.COLLECTIONS_UP_LV, param);

        // let upTipWinParam: XJ.collections.IUpTipsWinViewParam = {
        //     collectionCfgId: data.content.collectiblesVo.baseId,
        //     tipType: ECollUpTipType.upLV
        // };
        // G.UIManager.open(UICollectionsKey.UP_TIP_WIN, upTipWinParam);
        this.floatFightUpAni();
    }

    /**
     * 激活套装
     * 模块号：55	指令号：4
     */
    recActiveSuit(data: Vo.collectibles.ActiveSuitS2C, customData: IActiveSuitCustomData) {
        if (data.code < 0) {
            return;
        }
        let context = GIns.collectionsModel.context, content = data.content;
        context._updateSuitVo(content);
        let curAllActiveSuitStar = context.getAllActiveSuitStar(content.suitId);
        let param: XJ.collections.IActiveSetParam = {
            suidCfgId: content.suitId,
        }
        if (customData.AllActiveSuitStar.length != curAllActiveSuitStar.length) {
            param.newActiveStar = curAllActiveSuitStar.slice(customData.AllActiveSuitStar.length);
        }
        this.emit(NotificationKey.COLLECTIONS_ACTIVE_SET, param);
        this.emit(NotificationKey.COLLECTIONS_EQUIP_COLL_CHG);
        this.floatFightUpAni();
    }

    /**
     * 推送过期收藏品信息列表
     * 模块号：55	指令号：-1
     */
    pushExpiredVoList(data: Array<Vo.collectibles.CollectiblesVo>) {
        this._context._recPushExpiredVoList(data);
        this.emit(NotificationKey.COLLECTIONS_PUSH_EXPIRED, data);
        this.emit(NotificationKey.COLLECTIONS_EQUIP_COLL_CHG);
        this.floatFightUpAni();
    }

    pushTaskChange(changedTasks: Vo.task.TaskVo) {
        let isProgressChange = this.context._taskChange(changedTasks);

        if (isProgressChange) {
            this.floatFightUpAni();
        }
    }

    /** 首次获得收藏品弹窗 */
    private showFirstGetCollectionWin(newGetIds: number[]) {
        GIns.itemModel.tryShowGainNewHero(newGetIds);
    }

    /** 飘加战力 */
    @LogBusiness("收藏品飘战力")
    private floatFightUpAni() {
        this.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);//重新计算战力
        this.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);//飘战力
    }


    //region红点相关===========================================================================

    /**
     * 是否有可合成红点
     * @param collectionCfgId
     */
    redCompound(collectionCfgId: number) {
        return this._context.isCanCompound(collectionCfgId);
    }

    /**
     * 是否有升星红点
     * @param collectionCfgId
     */
    redUpStar(collectionCfgId: number) {
        let vo = this._context.getCollectionById(collectionCfgId);
        if (!vo || vo.isMaxStar()) return false;

        let allCollectionsCfg = GIns.collectionsCfgMgr.allCollectionsCfg
        let collCfg = allCollectionsCfg.get(collectionCfgId);
        let starCfg = GIns.collectionsCfgMgr.getStarCfg(collCfg.quality, vo.star + 1);
        let fragmentCount = GIns.backpackMgr.getItemCountByItemId(collCfg.fragmentItemId);
        return fragmentCount >= starCfg.fragmentCostAmount;
    }

    /**
     * 是否有升级红点
     * @param collectionCfgId
     */
    redUpLV(collectionCfgId: number) {
        let vo = this._context.getCollectionById(collectionCfgId);
        if (!vo || !vo.active || vo.isMaxLV()) return false;

        let allCollectionsCfg = GIns.collectionsCfgMgr.allCollectionsCfg;
        let collCfg = allCollectionsCfg.get(collectionCfgId);
        let LVCfg = GIns.collectionsCfgMgr.getLVCfg(collCfg.quality, vo.level + 1);
        return GIns.backpackMgr.isCanPayTheseItemArrayByConfig(LVCfg.costItems) == true;
    }

    /**
     * 是否有套装激活红点
     * @param collSuitCfgId
     */
    redSuit(collSuitCfgId: number) {
        let vo = this._context.getSuitById(collSuitCfgId);
        if (vo && vo.isSetMaxStarEff()) return false;

        if (this._context.isActiveSet(collSuitCfgId) == false) {
            let suitCollsCfg = GIns.collectionsCfgMgr.getSuit(collSuitCfgId);
            for (let collCfg of suitCollsCfg) {
                if (this._context.isHaveCollection(collCfg.id) == false) {
                    //套装没齐全
                    return false
                }
            }
        }

        if (!vo || vo.activated == false) {
            //套装齐全且未激活
            return true;
        }

        let suitStar = vo ? vo.suitStar : 0;
        let allStarEffs = GIns.collectionsCfgMgr.getSuitAllStarEffs(collSuitCfgId);
        for (let starInfo of allStarEffs) {
            if (suitStar >= starInfo.star && vo.isStarEffActived(starInfo.star) == false) {
                //有一个星级套装效果没激活
                return true
            }
        }

        return false;
    }
}