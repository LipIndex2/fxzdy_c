import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import { ConditionManager } from "../../../modules/condition/ConditionManager";
import { PlayerModel } from "../../../modules/player/model/PlayerModel";
import { BaseActivity } from "./BaseActivity";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivityConfigManager } from "db://assets/scripts/game/comm/activity/config/ActivityConfigManager";
import { ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { EnumActivityRespType } from "db://assets/scripts/game/comm/activity/enums/EnumActivityRespType";

/**
 * 活动vo基类
 * */
export abstract class BaseActivityVo extends BaseActivity {
    /**是否是功能 */
    public readonly isFunction: boolean = false;

    /** 开启时间 */
    public startTime: number;

    /** 领奖阶段开始时间 */
    public rewardTime: number;

    /** 结束时间 */
    public endTime: number;

    /** 活动不可见时间 */
    public visibleEndTime: number;

    /** 循环周期 */
    public period: number;

    /** 活动内容--包含活动对应的vo数据 */
    protected content: Object;

    /** 已领取奖励活动项-最后领奖日期 */
    public drawTimeMap: Object;

    /** 活动项奖励领取次数 */
    public drawCountMap: Object;

    /** 是否展示活动的时间 */
    private _isShowTime: boolean = true;

    /**
     * 整个活动是否完成
     * 首充领完奖励、签到那边领完奖励、成长之路领完奖励，都会变成 true
     * 不过隐患是，如果后面加了新奖励，也不会变成false
     * 这个字段有问题就找后端
     */
    private _done: boolean = false;
    // 完成时间
    private _doneTImeMs: number;

    /** 版本号 */
    private _version: number;

    /**
     * @param vo 活动下发基础vo
     * @see  Vo.activity.ActivityVo
     */
    public constructor(vo: Vo.activity.ActivityVo) {
        super();
        this.update(vo);
    }

    /**获取对应活动独自的vo对象
     * 子类必须实现
     * @see content
     */
    public abstract get activityVo(): any;



    get type(): ServerEnums.ActivityType {
        const type = ActivityConfigManager.getConfigById(this.activityId)?.type || "";
        return ServerEnums.ActivityType[type];
    }

    /**对应id活动的基础配置  */
    public get activityCfg(): table.activity.ActivityConstant.ActivityConfig {
        return TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, this.activityId);
    }

    // 显示配置
    getActivityClientConfig(): table.activity.ActivityConstant.ActivityClientConfig | null {
        return TableManager.getDataById(table.activity.ActivityConstant.ActivityClientConfig, this.activityId);
    }

    /**对应id活动的基础配置  */
    // public get activityClientCfg(): table.activity.ActivityConstant.ActivityClientConfig {
    //     return ActivityTableManager.ins.getMenuCfgByActivityId(this.activityId);
    // }

    public set isShowTime(_isShowTime: boolean) {
        this._isShowTime = _isShowTime;
    }

    /**是否展示活动时间
     * 后端规则--活动结束时间大于一年为永久活动不显示时间
     */
    public get isShowTime(): boolean {
        return this._isShowTime;
    }

    /**获取活动离结束的剩余时间 */
    public getLeftTime(): number {
        if (this.visibleEndTime) {
            return this.visibleEndTime - G.TimeManager.serverNow;
        }
        return this.endTime - G.TimeManager.serverNow;
    }

    /**
     * 生命周期. create/update 完成后
     */
    onInitDone() {
    }

    public update(vo: Vo.activity.ActivityVo) {
        this.activityId = vo.id;
        this.startTime = vo.startTime;
        this.rewardTime = vo.rewardTime;
        this.endTime = vo.endTime;
        this.isShowTime = vo.endTime < G.TimeManager.serverNow + 31536000000;
        this.period = vo.period;
        this.content = vo.content;
        this.drawTimeMap = vo.drawTimeMap;
        this.drawCountMap = vo.drawCountMap;
        this.visibleEndTime = vo.visibleEndTime;
        this._done = vo.done;
        this._doneTImeMs = vo.doneTime;
        this._version = vo.version;

        this.onInitDone();
    }

    /**更新活动内容-->>活动对应的vo数据 */
    public updateInfo(info: Object): void {
        this.content = info;
        G.FacadeManager.emit(NotificationKey.ACTIVITY_UPDATE, this.activityId);
    }

    getEndTimeMs() {
        if (this.visibleEndTime == 0) {
            return this.endTime;
        }
        return this.visibleEndTime;
    }

    /**更新奖励获取数据
     * @param rewardId 各个活动模块对应配置的奖励id
     */
    public updateRewardInfo(rewardId: number): void {
        this.drawTimeMap[rewardId] = G.TimeManager.serverNow;
    }

    /**更新奖励领取附加数据
     * 默认更新领取次数-->>drawCountMap
     */
    public updateRewardAdditional(additional: any): void {
        this.drawCountMap = additional;
    }

    /** 活动是否已完成 */
    public isDone(): boolean {
        return this._done;
    }

    // 所有完成时间
    get doneTimeMs(): number {
        return this._doneTImeMs;
    }

    /**
     * 活动版本号
     */
    get version(): number {
        return this._version;
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {
        if (this.visibleEndTime) {
            return !(this.visibleEndTime > G.TimeManager.serverNow);
        }
        return !(this.endTime > G.TimeManager.serverNow);
    }

    /**
     * 活动入口是否展示
     * @returns
     */
    public isShowEntrance(): boolean {
        if (this.isActivityOver()) return false;
        return true;
    }

    /**是否到领奖时间 */
    public isRewardTime(): boolean {
        return !(this.rewardTime > G.TimeManager.serverNow);
    }

    /**奖励是否可领取
     * @param rewardId 各个活动模块对应配置的奖励id
     */
    public isCanDrawReward(rewardId: string | number): boolean {
        return this.isRewardTime() && !this.drawTimeMap.hasOwnProperty(rewardId);
    }

    /**奖励是否被领取
     * @param rewardId 各个活动模块对应配置的奖励id
     */
    public isHadDrawReward(rewardId: string | number): boolean {
        return this.drawCountMap.hasOwnProperty(rewardId.toString()) || this.drawTimeMap.hasOwnProperty(rewardId.toString());
    }

    /**更新活动奖励
     * @param item 奖励key值，不同的活动有不同的意义
     */
    public updateReward(item: string | number): void {
        //已领奖的id;
        this.content["rewardIds"]?.push(item);
    }

    /**更新活动任务 */
    public updateTaskData(taskVo: Vo.task.TaskVo): void {
    }


    /**获取当前服务器时间离活动开启时间过去的天数
     * @returns days 过去了几天
     */
    public getPassDays(): number {
        let start = this.startTime;
        return Math.ceil((G.TimeManager.serverNow - start) / 86400000);
    }

    /**获取活动结束时间剩余的天数
     * @returns days 活动结束剩余几天
     */
    public getLeftDays(): number {
        let endTime = this.endTime;
        return Math.floor((endTime - G.TimeManager.serverNow) / 86400000);
    }

    /**
     *
     * @param type
     * @param serverRespObj 服务端任意返回, 可能 null
     * @param req
     */
    onServerResp(type: EnumActivityRespType,
        serverRespObj: any | null,
        req: ActivitySyncData
    ) {

    }

    /**获取当前服务器时间离活动开启时间过去的周数
     * @returns weeks 过去了几周
     */
    // public getPassWeekDays(): number {
    //     let startWeek: number = this.getWeekByData(this.startTime - (this.startTime % 86400000));
    //     return G.TimeManager.openServerWeek - startWeek + 1;
    // }

    /**获取活动开启时间所在的开服第几周
     * @returns weeks 活动开启时间所在的开服第几周
     */
    public getWeekByData(time: number): number {
        let date = new Date(time);
        // 通过getDay()方法获取到date是星期几
        let week = date.getDay();
        if (week == 0) week = 7;
        let off = 8 - week;
        let temp = G.TimeManager.openServerTime - ((G.TimeManager.openServerTime + 10800000) % 86400000);
        let start = this.startTime - (this.startTime % 86400000) + 18000000;
        let passStartDays = Math.ceil((start - temp) / 86400000);
        return Math.ceil((passStartDays - off) / 7) + 1;
    }

    /**获取角色创建时间 */
    // protected getPlayerCreateDate(): number {
    //     return PlayerModel.ins().Vo.createDate;
    // }

    /**验证活动是否开启 */
    public isOpen(showTip?: boolean): boolean {
        return ConditionManager.ins().checkCondition(this.activityCfg.openConditions, true, showTip);
    }

    /**是否有奖励可领取*/
    public hasAward(): boolean {
        return false;
    }

    /**活动中有商品可购买 需要子类自己实现逻辑*/
    public hasGoodsCanBuy():boolean {
        return false;
    }
}
