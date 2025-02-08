import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { TimeManager } from "../../../../core/time/TimeManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BaseActivity } from "../../../comm/activity/model/BaseActivity";
import NotificationKey from "../../../event/NotificationKey";
import { ConditionManager } from "../../condition/ConditionManager";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager } from "../SeasonManager";

export abstract class SeasonBaseVo extends BaseActivity {
    /**是否是功能 */
    public readonly isFunction: boolean = false;

    /** 开启时间 */
    public startTime: number;

    /** 领奖阶段开始时间 */
    public rewardTime: number;

    /** 结束时间 */
    public endTime: number;

    /**当前状态 1-未开启，2-开启中，3-结束*/
    public state: number;

    /** 活动不可见时间 */
    public visibleEndTime: number;

    /** 赛季活动 */
    public seasonId: number;

    /** 活动内容--包含活动对应的vo数据 */
    protected content: Object;

    /** 已领取奖励活动项-最后领奖日期 */
    public drawTimeMap: Object;

    /** 活动项奖励领取次数 */
    public drawCountMap: Object;

    /** 版本号 */
    private _version: number;

    /** 结算时间戳 */
    private settleTime:number;

    /**
     * @param vo 活动下发基础vo
     * @see  Vo.activity.ActivityVo
     */
    public constructor(vo: any) {
        super();
        this.update(vo);
    }

    /**获取对应活动独自的vo对象
     * 子类必须实现
     * @see content
     */
    public abstract get activityVo(): any;



    get type(): ServerEnums.SubSeasonActivityType {
        const type = SeasonConfigManager.getSubConfigById(this.activityId)?.type || "";
        return ServerEnums.SubSeasonActivityType[type];
    }

    /**对应id活动的基础配置  */
    public get activityCfg(): table.seasonactivity.Constant.SubSeasonActivityConfig {
        return TableManager.getDataById(table.seasonactivity.Constant.SubSeasonActivityConfig, this.activityId);
    }


    /**获取活动离结束的剩余时间 */
    public getLeftTime(): number {
        if (this.visibleEndTime) {
            return this.visibleEndTime - G.TimeManager.serverNow;
        }
        return this.endTime - G.TimeManager.serverNow;
    }

    /**获取活动离结算的剩余时间 */
    public getSettleTime(): number {
        return this.settleTime - G.TimeManager.serverNow;
    }

    /**
     * 生命周期. create/update 完成后
     */
    onInitDone() {
    }

    public update(vo: any) {
        this.activityId = vo.subActivityId != undefined ? vo.subActivityId : this.activityId;
        this.startTime = vo.startTime != undefined ? vo.startTime : this.startTime;
        this.rewardTime = vo.rewardTime != undefined ? vo.rewardTime : this.rewardTime;
        this.endTime = vo.endTime != undefined ? vo.endTime : this.endTime;
        this.settleTime = vo.settleTime != undefined ? vo.settleTime : this.settleTime;
        this.content = vo.content != undefined ? vo.content : this.content;
        this.drawTimeMap = vo.drawTimeMap != undefined ? vo.drawTimeMap : this.drawTimeMap;
        this.drawCountMap = vo.drawCountMap != undefined ? vo.drawCountMap : this.drawCountMap;
        this.visibleEndTime = vo.visibleEndTime != undefined ? vo.visibleEndTime : this.visibleEndTime;
        this._version = vo.version;
        this.state = vo.state != undefined ? vo.state : this.state;
        this.seasonId = vo.seasonId != undefined ? vo.seasonId : this.seasonId;
        this.onInitDone();
    }



    /**更新活动内容-->>活动对应的vo数据 */
    public updateInfo(info: Object): void {
        this.content = info;
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

    /**获取活动还有多久时间开启 */
    public getStartLeft(): number {
        const startTime = this.startTime;
        return startTime - G.TimeManager.serverNow;
    }


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

    /**验证活动是否开启 */
    public isOpen(showTip?: boolean): boolean {
        return ConditionManager.ins().checkCondition(this.activityCfg.openConditions, true, showTip);
    }

    /**是否有奖励可领取*/
    public hasAward(): boolean {
        return false;
    }


    /**获取当前子活动的状态 */
    public getSubActivityState(): ServerEnums.SeasonActivityState {
        const endTime = this.endTime;
        const startTime = this.startTime;
        const curTime = TimeManager.serverNow;
        if (curTime < startTime) {
            return ServerEnums.SeasonActivityState.NOT_START;
        }
        if (curTime > endTime) {
            return ServerEnums.SeasonActivityState.STOP;
        }
        return ServerEnums.SeasonActivityState.START;
    }

    //获取倒计时进度
    public getProgress(): number {
        const t = this;
        let pro = Math.floor((G.TimeManager.serverNow - t.startTime) / (t.endTime - t.startTime) * 100);
        pro = pro > 100 ? 100 : pro;
        return pro;
    }

    /**子活动基础信息 */
    public get cfg() {
        const t = this;
        const sid = t.activityId;
        const cfg = SeasonConfigManager.getSubConfigById(sid);
        return cfg;
    }

    /**获取该子活动的状态 1-未开启，2-开启中，3-结束*/
    public getSate() {
        return this.state;
    }


    
}