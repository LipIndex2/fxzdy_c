import { js } from "cc";
import { Logger } from "db://assets/scripts/core/log/Logger";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { EnumActivityRespType } from "db://assets/scripts/game/comm/activity/enums/EnumActivityRespType";
import { ActivityGrowthPathVo } from "db://assets/scripts/game/modules/activity/model/ActivityGrowUpVo";
import { ActivityHeroSupplyModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityHeroSupplyModelVo";
import { ActivitySevenDayTaskModelVo } from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { ActivityFlipCardModelVo } from "../../../modules/activity/model/ActivityFlipCardModelVo";
import { ConditionManager } from "../../../modules/condition/ConditionManager";
import { HeroManager } from "../../../modules/hero/HeroManager";
import { ItemUtils } from "../../../modules/item/utils/ItemUtils";
import { ActivityFactory } from "./ActivityFactory";
import { BaseActivityVo } from "./BaseActivityVo";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

/**充值活动viewstack初始化参数 */
export interface ActivityChargeSceneClass {
    /**充值活动viewstack对应类名数组 */
    clsArr: any[];
    /**充值活动viewstack对应菜单数组 */
    menuArr: any[];
    /**子活动id Map */
    childIdsMap?: Object;
}

/**活动发送协议同步数据 */
export interface ActivitySyncData {
    /**活动id */
    activityId: number;
    /**对应奖励或购买配置id */
    itemId: string;
    /**事件名 */
    key?: string;
    /**更新类型 */
    updateType?: string;
    /**更新值 */
    updateVal?: string;
    /**是否隐藏恭喜获得窗口 1:隐藏恭喜获得窗口，2:显示恭喜获得窗口，3:自动区分道具显示规则 */
    hidePopWin?: number;
    /**是否合并奖励 */
    isCombine?: boolean;
    /** 奖励展示类型 */
    isUseItemGetWin?: number;
    /**走活动自定义流程 */
    isCustom?: boolean;
    /**
     * 113-4 处理次数
     */
    times?: number;
    /**
     * 1113-4 其它参数
     */
    otherParams?: string;
}

/**
 * 循环活动模块定义
 * @author GameCreator
 */
export class ActivityModel extends BaseModel {
    /**
     * @see {活动id：活动vo}
     */
    private _activityMap: { [activityId in number]: BaseActivityVo } = js.createMap();

    /**
     * @see {活动id：活动状态}
     */
    private _activityStateMap: Object = js.createMap();

    /**
     * @see {活动id：活动状态vo}
     */
    private _activityStateVoMap: Object = js.createMap();

    /**
     * @see {活动type：活动[vo]}
     */
    private _activityTypeMap: { [ServerEnums$ActivityType in number]: BaseActivityVo[] } = js.createMap();

    /**
     * @see {活动contentGroupId：活动[vo]}
     */
    private _activityContentGroupIdMap: Object = js.createMap();

    /**
     * 活动入口展示Map
     * @see {入口类型：活动id}
     * @see ActivityEntranceType
     */
    private _activityEntranceMap: Object = {};

    /**对应类型列表请求当前page记录
     * @see {列表数据活动id：当前请求page}
     * @abstract 1-活动排行榜
     */
    private _curRequestPageMap: Object = {};

    /**对应类型列表最大page
     * @see {列表数据活动id：最大page}
     * @abstract 1-活动排行榜
     */
    private _curRequestMaxPageMap: Object = {};

    /**对应类型列表请求当前page记录
     * @see {列表数据活动id：当前请求page}
     * @abstract 1-活动子排行榜
     */
    private _curRequestSubPageMap: Object = {};

    /**对应类型列表最大page
     * @see {列表数据活动id：最大page}
     * @abstract 1-活动子排行榜
     */
    private _curRequestSubMaxPageMap: Object = {};

    // /**活动排行榜 */
    // private _activityRankingVo: { [key: number]: RankingVo } = {};
    // /**活动子排行榜 */
    // private _activitySubRankingVo: { [key: number]: RankingVo } = {};

    /**
     * 模块标识
     */
    private MODULE = 113;

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
        this.registerMsg(moduleId, 1, this.recActivity, true);
        this.registerMsg(moduleId, 2, this.recCurrentActivities);
        this.registerMsg(moduleId, 3, this.recDrawItemReward);
        this.registerMsg(moduleId, 4, this.recBuyGoods);
        this.registerMsg(moduleId, 5, this.recGetRankList);
        this.registerMsg(moduleId, 6, this.recGetSubRankList);

        this.registerMsg(moduleId, -1, this.pushActivityProgress);
        this.registerMsg(moduleId, -2, this.pushGlobalActivityState);
        this.registerMsg(moduleId, -4, this.pushActivityReward);
        this.registerMsg(moduleId, -5, this.pushActivityRewardInfo);
        this.registerMsg(moduleId, -6, this.pushCostExpireItem);
        this.registerMsg(moduleId, -7, this.pushActivityDone);
        this.registerMsg(moduleId, -8, this.pushActivityStuff);
    }

    listNotificationInterests(): string[] {
        return [NotificationKey.SYSTEM_NEW_DAY, NotificationKey.HERO_UP_LEVEL];
    }

    handleNotification(name: string, args?: any): void {
        switch (name) {
            case NotificationKey.SYSTEM_NEW_DAY:
                this.sendCurrentActivities();
                break;
            case NotificationKey.HERO_UP_LEVEL:
                this.checkSendActivityList();
                break;
        }
    }

    /****************************************根据活动type获取数据接口 (type不是唯一的) ****************************************/
    /**通过对应活动类型获取开启中的活动id*/
    public getActivityVoByType<T extends BaseActivityVo>(activityType: ServerEnums.ActivityType): T {
        let activityVos = this._activityTypeMap[activityType];
        return activityVos ? activityVos[0] : (null as any);
    }

    /**通过对应活动类型获取所有开启中的活动Vos*/
    public getActivityVosByType(activityType: ServerEnums.ActivityType): BaseActivityVo[] {
        let activityVos = this._activityTypeMap[activityType];
        return activityVos || [];
    }

    /**通过对应活动类型获取所有开启中的活动Vos*/
    public getActivityIdsByType(activityType: ServerEnums.ActivityType): number[] {
        let activityVo = this.getActivityVosByType(activityType);
        let ids = [];
        if (activityVo) {
            for (let i = 0; i < activityVo.length; i++) {
                ids.push(activityVo[i].activityId);
            }
        }
        return ids;
    }

    /** 判断活动是否开启 */
    public isActivityOpenByType(activityType: number): boolean {
        let activityVo: BaseActivityVo = this.getActivityVoByType(activityType);
        return activityVo && activityVo.isShowEntrance() && activityVo.isOpen(false);
    }

    /**活动是否可以推荐 */
    public isActivityRecommendByType(activityType: number): boolean {
        let activityVo: BaseActivityVo = this.getActivityVoByType(activityType);
        return activityVo && activityVo.isShowEntrance() && activityVo.isOpen(false) && !activityVo.isBuyedAllChargeItems();
    }

    public getActivityLeftTimeByType(activityType: number): number {
        let activityVo: BaseActivityVo = this.getActivityVoByType(activityType);
        return activityVo ? activityVo.getLeftTime() : 0;
    }

    /**通过对应活动类型获取开启中的活动id
     * @param activityType 活动类型
     * @return 开启中的活动id 未开启返回 0
     */
    public getActivityIdByType(activityType: ServerEnums.ActivityType): ServerEnums.ActivityType {
        let activityVo = this.getActivityVoByType(activityType);
        return activityVo ? activityVo.activityId : 0;
    }

    public getActivityVoArrayByType(activityType: ServerEnums.ActivityType): Array<BaseActivityVo> {
        return this._activityTypeMap[activityType] || [];
    }

    // 获取某个类型的默认 Vo
    public getDefaultActivityVoByType<T extends BaseActivityVo>(activityType: ServerEnums.ActivityType): T | null {
        const array = this._activityTypeMap[activityType] || [];
        return array[0] as T;
    }

    /**获取所有活动vo*/
    public getAllVos(): BaseActivityVo[] {
        let arr = [];
        for (let key in this._activityMap) {
            let activityId: number = Number(key);
            arr.push(this._activityMap[key]);
        }
        return arr;
    }

    /****************************************根据活动内容组id获取数据接口 (contentGroupId不是唯一的) ****************************************/
    /**通过对应活动内容组id获取开启中的活动vo
     * @param contentGroupId 活动内容组id
     */
    public getActivityVoByContentGroupId(contentGroupId: number): BaseActivityVo {
        let activityVos = this._activityContentGroupIdMap[contentGroupId];
        return activityVos ? activityVos[0] : null;
    }

    /**通过对应活动内容组id获取开启中的活动id
     * @param contentGroupId 活动类型
     * @return 开启中的活动id 未开启返回 0
     */
    public getActivityIdByContentGroupId(contentGroupId: number): number {
        let activityVo = this.getActivityVoByContentGroupId(contentGroupId);
        return activityVo ? activityVo.activityId : 0;
    }

    /****************************************根据活动id获取数据接口 (id是唯一的) ****************************************/
    /**获取对应活动id的数据 */
    public getActivityVoById<T extends BaseActivityVo>(activityId: number): T {
        return this._activityMap[activityId] as any;
    }

    /** 获取对应活动id的状态 */
    public getActivityStateById(activityId: number): number {
        return this._activityStateMap[activityId];
    }

    /** 获取对应活动id的状态Vo */
    public getActivityStateVoById(activityId: number): Vo.activity.ActivityStateVo {
        return this._activityStateVoMap[activityId];
    }

    /** 判断指定的活动是否开启*/
    public isActivityOpenById(activityId: number): boolean {
        let activityVo: BaseActivityVo = this.getActivityVoById(activityId);
        return activityVo && activityVo.isShowEntrance() && activityVo.isOpen(false);
    }

    public getActivityLeftTimeById(activityId: number): number {
        let activityVo: BaseActivityVo = this.getActivityVoById(activityId);
        return activityVo ? activityVo.getLeftTime() : 0;
    }

    /**活动是否可以推荐 */
    public isActivityRecommendById(activityId: number): boolean {
        let activityVo: BaseActivityVo = this.getActivityVoById(activityId);
        return activityVo && activityVo.isShowEntrance() && activityVo.isOpen(false) && !activityVo.isBuyedAllChargeItems();
    }

    /**获取活动活动类型
     * @param activityId 活动id
     */
    public getActivityType(activityId: number): ServerEnums.ActivityType {
        let cfg: table.activity.ActivityConstant.ActivityConfig = TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, activityId);
        return cfg ? ServerEnums.ActivityType[cfg.type] : -1;
    }

    /**获取活动内容组id
     * @param activityId 活动id
     */
    public getActivityContentGroupId(activityId: number): number {
        // let cfg: table.activity.ActivityConstant.ActivityConfig = TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, activityId);
        // return cfg ? cfg.contentGroupId : -1;
        return -1;
    }

    // /**获取活动排行榜数据 */
    // public getActivityRankingVoById(activityId: number): RankingVo {
    //     return this._activityRankingVo[activityId];
    // }

    // /**获取活动子排行榜数据 */
    // public getActivitySubRankingVoById(activityId: number): RankingVo {
    //     return this._activitySubRankingVo[activityId];
    // }

    /***************************************数据处理--更新******************************************* */
    // public removeActivityEntranceMap(activityId: number) {
    //     let activityClientCfg = TableManager.getDataById(table.activity.ActivityConstant.ActivityClientConfig, activityId);
    //     if (activityClientCfg) {
    //         let entranceInfoArr: number[] = this._activityEntranceMap[activityClientCfg.entranceType];
    //         if (entranceInfoArr) {
    //             let index = entranceInfoArr.indexOf(activityId);
    //             if (index >= 0) {
    //                 entranceInfoArr.splice(index, 1);
    //                 this._activityEntranceMap[activityClientCfg.entranceType] = entranceInfoArr;
    //             }
    //         }
    //     }
    // }

    /**活动结束移除 */
    public removeActivity(activityId: number): void {
        if (this._activityMap[activityId]) {
            let baseVo: BaseActivityVo = this._activityMap[activityId] as BaseActivityVo;
            if (baseVo.isFunction) return;

            let vos: BaseActivityVo[] = this._activityTypeMap[this.getActivityType(activityId)];
            if (vos) {
                let index = vos.indexOf(baseVo);
                if (index !== -1) {
                    vos.splice(index, 1);
                }
            }
            let conVos: BaseActivityVo[] = this._activityContentGroupIdMap[this.getActivityContentGroupId(activityId)];
            if (conVos) {
                let index = conVos.indexOf(baseVo);
                if (index !== -1) {
                    conVos.splice(index, 1);
                }
            }
            delete this._activityMap[activityId];
        }
        G.FacadeManager.emit(NotificationKey.ACTIVITY_END_REFRESH, activityId);
    }

    /**更新/创建活动vo */
    private createOrUpdateActivityVo(vo: Vo.activity.ActivityVo): void {
        let baseVo: BaseActivityVo;
        let activityType: ServerEnums.ActivityType;
        const activityId = vo.id;
        if (this._activityMap[activityId]) {
            baseVo = this._activityMap[activityId] as BaseActivityVo;
            baseVo.update(vo);
        } else {
            activityType = this.getActivityType(activityId);
            if (activityType < 0) {
                Logger.error("后端开启了活动, 单没找到配置. 策划检查配置 ActivityConfig.type | 活动 activityId = ", activityId);
                return;
            }
            // 活动vo在这统一按类型创建
            const newVo = ActivityFactory.creatActivityVo(activityType, vo);
            this._activityMap[activityId] = newVo;

            if (!this._activityTypeMap[activityType]) {
                this._activityTypeMap[activityType] = [];
            }
            this._activityTypeMap[activityType].push(this._activityMap[activityId]);

            let contentGroupId: number = this.getActivityContentGroupId(activityId);
            if (!this._activityContentGroupIdMap[contentGroupId]) {
                this._activityContentGroupIdMap[contentGroupId] = [];
            }
            this._activityContentGroupIdMap[contentGroupId].push(this._activityMap[activityId]);
        }

        FacadeManager.ins().emit(NotificationKey.ACTIVITY_DATA_RELOAD);
    }

    /**更新活动奖励数据
     * @param additional 领取活动奖励返回的附加信息
     */
    public updateActivityRewardInfo(info: ActivitySyncData, additional: any): void {
        let baseVo: BaseActivityVo = this._activityMap[info.activityId] as BaseActivityVo;
        let activityType = this.getActivityType(info.activityId);
        switch (activityType) {
            case ServerEnums.ActivityType.SIGN:
                if (additional) {
                    for (let id of additional) {
                        baseVo.updateRewardInfo(Number(id));
                    }
                }
                break;
            case ServerEnums.ActivityType.TOTAL_CHARGE_DAY:
                baseVo.updateReward(info.itemId.toInt());
                break;
            case ServerEnums.ActivityType.HERO_SUPPLY:
                (baseVo as ActivityHeroSupplyModelVo).onGetRewardIds(additional);
                break;
            case ServerEnums.ActivityType.LOTTERY:
                (baseVo as ActivityFlipCardModelVo).isEnterNextRound = additional;
                break;
            default:
                baseVo.updateRewardInfo(Number(info.itemId));
                break;
        }

        if (additional) baseVo.updateRewardAdditional(additional);
    }

    /**更新活动列表 */
    public updateActivityList(vos: Array<Vo.activity.ActivityVo>): void {
        let hasKeyMap: Object = {};
        for (let i = 0; i < vos.length; i++) {
            this.createOrUpdateActivityVo(vos[i]);
            hasKeyMap[vos[i].id] = 1;
        }

        //活动结束移除数据操作
        for (let key in this._activityMap) {
            let activityId: number = Number(key);
            if (!hasKeyMap.hasOwnProperty(activityId)) {
                this.removeActivity(activityId);
            }
        }
    }

    /** 更新活动状态 */
    public updateActivityState(infos: Array<Vo.activity.ActivityStateVo>): void {
        for (let info of infos) {
            let baseVo = this._activityStateMap[info.activityId];
            if (baseVo) {
                baseVo = info.state;
            } else {
                this._activityStateMap[info.activityId] = info.state;
            }

            let stateVo = this._activityStateVoMap[info.activityId];
            if (stateVo) {
                stateVo = info;
            } else {
                this._activityStateVoMap[info.activityId] = info;
            }
        }
    }

    private customHandle(activityId, content: Vo.cost.CostAndRewardVo) {
        let activityVo = this._activityMap[activityId] as BaseActivityVo;
        if (activityVo) {
            activityVo.customHandle(content);
        }
    }

    /**处理特殊值--更新活动内容 */
    private dealSpecialData(activityId: number, updateType: string, updateVal: string, additional: any): void {
        let activityVo = this._activityMap[activityId] as BaseActivityVo;
        if (activityVo) {
            activityVo.updateVo(updateType, updateVal, additional);
        }
    }

    /**判断是否请求活动列表 */
    private checkSendActivityList() {
        let cfgs: table.activity.ActivityConstant.ActivityConfig[] = TableManager.getAllData(table.activity.ActivityConstant.ActivityConfig);
        for (let i = 0; i < cfgs.length; i++) {
            let cfg = cfgs[i];
            if (ConditionManager.ins().checkCondition(cfg.openConditions) && !this._activityMap[cfg.id]) {
                this.sendCurrentActivities();
                return;
            }
        }
    }

    /*********************************协议发送*********************************/

    /**
     * 获取活动信息
     * 模块号：113	指令号：1
     */
    public sendActivity(activityId: number | string): void {
        let c2s = {} as Vo.activity.ActivityC2S;
        c2s.activityId = Number(activityId);
        this.send(this.MODULE, 1, c2s, activityId);
    }

    /**
     * 获取当前所有的活动信息
     * 模块号：113	指令号：2
     */
    public sendCurrentActivities(): void {
        this.send(this.MODULE, 2);
    }

    /**
     * 领取活动项奖励
     * 模块号：113	指令号：3
     * @param activityId 活动id
     * @param rewardId 奖励活动项id
     */
    public sendDrawItemReward(data: ActivitySyncData): void {
        let c2s = {} as Vo.activity.DrawItemRewardC2S;
        c2s.activityId = data.activityId;
        c2s.itemId = data.itemId;
        this.send(this.MODULE, 3, c2s, data);
    }

    /**
     * 处理活动事务
     * 领奖处理不了的东西，都交给这个接口
     * 模块号：113	指令号：4
     */
    public sendBuyGoods(data: ActivitySyncData): void {
        let c2s = {} as Vo.activity.HandleStuffC2S;
        c2s.activityId = data.activityId;
        c2s.stuff = data.itemId;
        c2s.times = data.times;
        c2s.otherParams = data.otherParams;
        this.send(this.MODULE, 4, c2s, data);
    }

    /**
     * 113-4  扩展接口
     * 购买商品 协议返回走自己的vo处理
     * */
    public sendBuyGoodsByCustom(activityId: number, goodsId: string | number, times?: number, otherParams?: string): void {
        let c2s = {} as Vo.activity.HandleStuffC2S;
        c2s.activityId = activityId;
        c2s.stuff = goodsId.toString();
        c2s.times = times;
        c2s.otherParams = otherParams;
        this.send(this.MODULE, 4, c2s, { activityId: activityId, itemId: goodsId, isCustom: true } as ActivitySyncData);
    }

    /**
     * 113-4  扩展接口
     * @param key 事件， 将作为事件 ACTIVITY_UPDATE_${key} 回调
     */
    public sendActionByKey(data: ActivitySyncData): void {
        let c2s = {} as Vo.activity.HandleStuffC2S;
        c2s.activityId = data.activityId;
        c2s.stuff = data.itemId.toString();
        c2s.times = data.times;
        c2s.otherParams = data.key;
        this.send(this.MODULE, 4, c2s, data);
    }

    /**
     * 获取活动排行榜
     * 模块号：113	指令号：5
     */
    public sendGetRankList(activityId: number, page: number): void {
        let c2s = {} as Vo.activity.GetRankListC2S;
        c2s.activityId = activityId;
        c2s.page = page;
        this.send(this.MODULE, 5, c2s, c2s);
    }

    /**
     * 获取活动排行榜
     * 模块号：113	指令号：6
     */
    public sendGetSubRankList(): void {
        let c2s = {} as Vo.activity.GetSubRankListC2S;
        this.send(this.MODULE, 6, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 获取活动信息
     * 模块号：113	指令号：1
     */
    public recActivity(result: Vo.activity.ActivityS2C, activityId: string): void {
        if (result.code >= 0) {
            this.createOrUpdateActivityVo(result.content);
            this.emit(NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK, activityId);
            return;
        }
    }

    /**
     * 获取当前所有的活动信息
     * 模块号：113	指令号：2
     */
    public recCurrentActivities(result: Vo.activity.CurrentActivitiesS2C): void {
        if (result.code >= 0) {
            this.updateActivityList(result.content.activityVos);
            this.updateActivityState(result.content.activityStateVos);
            this.emit(NotificationKey.ACTIVITY_REQUEST_BACK);
            return;
        }
    }

    /**
     * 领取活动项奖励
     * 模块号：113	指令号：3
     */
    public recDrawItemReward(result: Vo.activity.DrawItemRewardS2C, info: ActivitySyncData): void {
        const activityId = info.activityId;
        if (result.code < 0) {
            return;
        }
        //info -- 判空容錯：回传info为空，可能调用了两次回调
        if (!info) {
            return;
        }

        // 获得奖励 + 弹出
        const serverRewards = result.content.rewardResults;
        const serverRespObj: any = result.content.additional;
        switch (info.hidePopWin) {
            case 1:
                G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, serverRewards);
                break;
            case 2:
                G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, serverRewards);
                break;
            default:
                G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, serverRewards);
                break;
        }

        // 处理
        let activityVo: BaseActivityVo = this._activityMap[activityId] as BaseActivityVo;
        if (activityVo) {
            activityVo.onServerResp(EnumActivityRespType.GAIN_ITEM, serverRespObj, info);
        }

        // 活动积分类
        this.dealSpecialData(activityId, info.updateType, info.updateVal, serverRespObj);

        // 活动任意形式的数据, 任务/天数
        this.handleInfoByActivityType(info);

        // 更新奖励
        this.updateActivityRewardInfo(info, serverRespObj);
        G.FacadeManager.emit(NotificationKey.ACTIVITY_UPDATE, activityId);

        //首次获得英雄
        this._newHeroIds = [];
        for (let data of serverRewards) {
            let item = ItemUtils.getItemConfigByItemId(data.baseId);
            if (item.type == "HERO_CARD") {
                let heroVo = HeroManager.ins().getHeroVoByID(data.baseId);
                if (!heroVo.heroVoData.isActivate) {
                    this._newHeroIds.push(data.baseId);
                }
            }
        }
        if (this._newHeroIds.length > 0) {
            //这里暂时接招募动画，等通用那边接好在注释掉
            G.GameTimer.once(100, this, this.showGetHeroAnim);
            // this.showGetHeroAnim();
        }
    }

    /** 新获得的英雄id组 */
    private _newHeroIds = [];

    //展示获得英雄动画
    public showGetHeroAnim() {
        if (this._newHeroIds.length <= 0) {
            return;
        }

        // 打开新获得英雄界面 | TODO 这里是临时处理的, 后面删掉
        // DrawCardModel.ins().addNewHeroIdArrayToQueue(this._newHeroIds)
        // G.UIManager.open(DrawCardUIKeys.DrawCardGetNewHeroViewV2, DrawCardGetNewHeroViewOpenArgs.create(this._newHeroIds[0], EnumGainNewHeroType.REWARD));

        // this._newHeroIds.shift();

        this._newHeroIds = [];
    }

    /**
     * 处理活动事务 (购买商品)
     * 模块号：113	指令号：4
     */
    public recBuyGoods(result: Vo.activity.HandleStuffS2C, info: ActivitySyncData): void {
        if (result.code >= 0 && result.content) {
            const activityId = info.activityId;
            if (info.isCustom) {
                this.customHandle(activityId, result.content);
                return;
            }

            // 扣款
            const costItems = result.content.costs;
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItems);

            // 奖励
            const rewards = result.content.rewards;
            const serverRespObj = result.content.addition;
            switch (info.hidePopWin) {
                case 1:
                    G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, rewards);
                    break;
                case 2:
                    G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, rewards);
                    break;
                default:
                    G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewards);
                    break;
            }

            // 处理
            let activityVo: BaseActivityVo = this._activityMap[activityId] as BaseActivityVo;
            if (activityVo) {
                activityVo.onServerResp(EnumActivityRespType.BUY, serverRespObj, info);
            }

            // handle
            this.dealSpecialData(activityId, info.updateType, info.updateVal, result.content.addition);
            if (!info.updateType) {
                this.updateActivityRewardInfo(info, result.content.addition);
            }
            G.FacadeManager.emit(NotificationKey.ACTIVITY_UPDATE, activityId);

            if (info.key) {
                //为了事件参数扩展
                G.FacadeManager.emit(NotificationKey.ACTIVITY_UPDATE + "_" + info.key, {
                    activityId: activityId,
                    rewards: rewards,
                    addition: result.content.addition,
                });
            }
            return;
        }
        G.FacadeManager.emit(NotificationKey.ACTIVITY_UPDATE, info.activityId);
    }

    /**
     * 获取活动排行榜
     * 模块号：113	指令号：5
     */
    public recGetRankList(data: Vo.activity.GetRankListS2C, clientData: Vo.activity.GetRankListC2S): void {
        if (data.code >= 0) {
            let rankVo: Vo.ranking.RankingVo | Vo.secretinstance.SecretInstanceRankingVo = data.content as Vo.ranking.RankingVo | Vo.secretinstance.SecretInstanceRankingVo;
            DebugUtils.isDebugMode() && console.log("活动排行榜返回", rankVo);
            G.FacadeManager.emit(NotificationKey.ACTIVITY_RANK_UPDATE, { rankVo, clientData });
        }
    }

    /**
     * 获取活动排行榜
     * 模块号：113	指令号：6
     */
    public recGetSubRankList(result: Vo.activity.GetSubRankListS2C, info: { page: number; activityId: number; extraParam: string }): void {
        if (result.code >= 0) {
            if (!result.content) return; //后端说有可能为空，让前端兼容一下

            return;
        }
    }

    /*********************************协议推送*********************************/

    /**
     * 活动处理进度信息推送
     * 模块号：113	指令号：-1
     */
    public pushActivityProgress(info: Object): void {
        for (let id in info) {
            let vo: BaseActivityVo = this._activityMap[id];
            if (vo) {
                vo.updateInfo(info[id]);
            } else {
                this.sendActivity(id);
            }
        }
    }

    /**
     * 推送全服活动状态
     * 模块号：113	指令号：-2
     */
    public pushGlobalActivityState(info: Vo.activity.GlobalActivityNewStateVo): void {
        //活动结束--活动状态 ,1:未开启 2 尚未开始展示 3 开启中 4发奖阶段  5 后端结束
        if (info.state === 3 || info.state === 4) {
            if (!this._activityMap[info.activityId]) {
                let activityCfg: table.activity.ActivityConstant.ActivityConfig = TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, info.activityId);
                if (activityCfg && ConditionManager.ins().checkCondition(activityCfg.openConditions)) {
                    this.sendActivity(info.activityId);
                }
            }
        } else if (info.state === 5) {
            this.removeActivity(info.activityId);
        }

        // this.updateActivityState([info]);
        let baseVo = this._activityStateMap[info.activityId];
        if (baseVo) {
            baseVo = info.state;
        } else {
            this._activityStateMap[info.activityId] = info.state;
        }
    }

    /**
     * 推送活动奖励
     * 模块号：113	指令号：-4
     */
    public pushActivityReward(info: Vo.activity.ActivityRewardVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        let vo: BaseActivityVo = this._activityMap[info.activityId];
        if (vo) {
            vo.updateReward(info.item);

            //更新活动奖励,按活动类型处理奖励弹出方式
            switch (ServerEnums.ActivityType[vo.activityCfg.type]) {
                case ServerEnums.ActivityType.FIRST_CHARGE:
                case ServerEnums.ActivityType.CAREER_TRIAL:
                    G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, info.rewardResults);
                    break;
                default:
                    G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, info.rewardResults);
                    break;
            }
        } else {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, info.rewardResults);
        }

        //更新活动
        G.FacadeManager.emit(NotificationKey.ACTIVITY_REWARD_UPDATE, info.activityId);

        //首次获得英雄
        this._newHeroIds = [];
        for (let data of info.rewardResults) {
            let item = ItemUtils.getItemConfigByItemId(data.baseId);
            if (item.type == "HERO_CARD") {
                let heroVo = HeroManager.ins().getHeroVoByID(data.baseId);
                if (!heroVo.heroVoData.isActivate) {
                    this._newHeroIds.push(data.baseId);
                }
            }
        }
        if (this._newHeroIds.length > 0) {
            //这里暂时接招募动画，等通用那边接好在注释掉
            this.showGetHeroAnim();
        }
    }

    /**
     * 推送任务奖励信息
     * 模块号：113	指令号：-5
     * @param activityId 活动Id
     * @param rewardVo   任务奖励信息
     */
    public pushActivityRewardInfo(pushData: Vo.activity.ActivityTaskRewardVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        if (pushData && pushData.rewardVo.rewardsResult && pushData.rewardVo.rewardsResult.length) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, pushData.rewardVo.rewardsResult);
        }
    }

    /**
     * 推送活动过期物品扣除
     * 模块号：113	指令号：-6
     */
    public pushCostExpireItem(costData: Array<Vo.cost.CostItemResult>): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costData);
    }

    /**
     * 推送活动已完成，返回活动Id （前端结束活动）
     * 模块号：113	指令号：-7
     */
    public pushActivityDone(id: number): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        this.sendActivity(id);
    }

    /**
     * 推送活动事务相关信息，ActivityStuffVo
     * 模块号：113	指令号：-8
     */
    public pushActivityStuff(vo: Vo.activity.ActivityStuffVo): void {
        switch (vo.key) {
            case "FIRST_PASS": //冲榜活动,首通奖励
            case "LADDER_FIRST_PASS":
                this.sendActivity(vo.activityId);
                break;
            case "JACKPOT":
                let _vo = this.getActivityVoById(vo.activityId) as any;
                _vo.record = vo.stuffVo;
                break;
            case 'SETTLE':
                let _vo2 = this.getActivityVoById(vo.activityId) as any;
                if (_vo2) {
                    if (!_vo2.activityVo?.settleVos) {
                        _vo2.activityVo.settleVos = [];
                    }
                    _vo2.activityVo.settleVos.push(vo.stuffVo);
                }
            default:
                break;
        }

        //TODO 推送消息-在这里处理服务端返回的数据
        this.emit(NotificationKey.ACTIVITY_STUFF_UPDATE, vo);
    }

    init() {
        ActivityTaskConfigManager.init();
    }

    private handleInfoByActivityType(info: ActivitySyncData) {
        const activityId = info.activityId;

        let activityVo = this._activityMap[activityId] as BaseActivityVo;
        if (!activityVo) {
            return;
        }

        const uidStr = info.itemId;
        switch (activityVo.type) {
            case ServerEnums.ActivityType.GROW_UP:
                const v = activityVo as ActivityGrowthPathVo;
                v.finshTask(uidStr);
                break;
            case ServerEnums.ActivityType.CARNIVAL: {
                const v = activityVo as ActivitySevenDayTaskModelVo;
                if (uidStr.startsWith("TASK_")) {
                    v.finshTask(uidStr);
                }
                if (uidStr.startsWith("SCORE_")) {
                    v.markGainRewardIdByServer(uidStr);
                }
                break;
            }
            case ServerEnums.ActivityType.TOTAL_CHARGE_DAY:
                break;
        }
    }
}
