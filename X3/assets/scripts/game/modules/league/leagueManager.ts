import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { AttrData } from "../attr/AttrManager";
import { PlayerModel } from "../player/model/PlayerModel";
import { EventRankDataResp } from "../rank/event/EventRankData";
import { LeagueModel } from "./LeagueModel";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { Logger } from "db://assets/scripts/core/log/Logger";


export class LeagueManager extends BaseSingleton implements INotification {


    /**职业数组 */
    public mCareerList = [ServerEnums.Career.TANK, ServerEnums.Career.FIGHTER, ServerEnums.Career.MAGE, ServerEnums.Career.MARKSMAN, ServerEnums.Career.RIDER, ServerEnums.Career.SUPPORT];


    //联盟创建选择的图标和banner索引
    public createSelectData = [0, 0];


    /**联盟排行榜数据 */
    public mEventRankDataResp: EventRankDataResp;

    /**联盟成员列表当前分页 */
    public pageIndexMember: number = 1;
    /**联盟成员列表数据 */
    public mLeagueMemberList: Vo.league.LeagueMemberVo[] = [];


    /**联盟排行榜数据 */
    mRankCommonData: Vo.league.LeagueFightRankItemVo[] = [];

    /*登录下发的信息 */
    public mPlayerLeagueLoginVo: Vo.league.PlayerLeagueLoginVo;
    /**我的联盟详细信息 */
    public mLeagueVo: Vo.league.LeagueVo;

    //**申请我的联盟的玩家列表 */
    public applyPlayers: Vo.league.LeagueApplyVo[];
    //**服务端返回的联盟列表  查找，分页，刷新 */
    public serverLeagueList: Vo.league.LeagueBriefVo[];
    //分页当前页签
    public serverLeagueListPageRes: Vo.common.PageRes;

    // /**联盟boss信息 */
    // public leagueBossInfo:Vo.league.LeagueBossVo;
    /**联盟boss阶段信息 */
    public leagueBossStageInfo: Vo.league.LeagueStageBossVo;

    /**联盟boss排行榜数据 */
    public mLeagueBossRankingVo: Vo.league.LeagueBossRankingVo;
    /**联盟boss排行榜列表 */
    public leagueBossRank: Vo.ranking.RankItemVo[];

    protected _maxInviteTimes: number = -1

    protected _boxIconPath: string = null;

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_EXIT_LEAGUE,
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_EXIT_LEAGUE: {
                this.onExitLeague();
                break;
            }
        }
    }


    protected onInit() {
        super.onInit();
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);
    }

    // 所有情况被退出了联盟
    onExitLeague() {
        this.mLeagueVo.level = 0
        this.mLeagueVo.leagueId = 0;

        Logger.game("[League] 退出了联盟 | 可能是被踢的");
    }

    // 添加联盟 boss 排行
    public addLeagueBossRank(data: Vo.league.LeagueBossRankingVo): void {
        this.mLeagueBossRankingVo = data;
        if (!this.leagueBossRank)
            this.leagueBossRank = data.list;
        else
            this.leagueBossRank = this.leagueBossRank.concat(data.list);
    }

    /**
     * 将自己加入已领取 联盟宝箱赠礼条目
     */
    public deleteLeagueBoxGift(giftItemId): void {
        let map = this.mLeagueVo.leagueGiftVoMap;
        let vo = map[giftItemId];
        vo.drawPlayerIds.push(PlayerModel.ins().Vo.id);

    }

    /**移除送出条目 */
    public deleteSendLeagueBoxGift(giftItemId: number): void {
        let map = this.mPlayerLeagueLoginVo.giftMap;
        //移除
        delete map[giftItemId];


    }

    /**移除到期的礼物 */
    public deleteExpiredLeagueBoxGift(): void {
        let map = this.mLeagueVo.leagueGiftVoMap;

        let keys = Object.keys(map);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let vo = map[key];
            //过期的
            if (vo.expireTime < G.TimeManager.serverNow) {
                delete map[key];
            }
        }
        //抛事件
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_GIFT_CHANGE);
    }

    /**
     * 该模块所有合并后的属性
     */
    getMergedAllAddAttrDataArray(): Array<AttrData> {
        const attrArray = [];

        //联盟科技
        let leagueTechVos = this.mPlayerLeagueLoginVo.leagueTechVos;
        for (let i = 0; i < leagueTechVos.length; i++) {
            let techData = leagueTechVos[i];
            let techCfg = LeagueModel.ins().getLeagueTechCfg(techData.career, techData.slotId, techData.level);
            if (techCfg) {

                let total = LeagueModel.ins().getTechAttrTotal(techData.career, techData.slotId, techData.level);
                let attrData = AttrData.create(total.k, total.v);
                attrData.unitEffectiveType = techData.career
                attrArray.push(attrData);
            }
        }

        return attrArray;
    }

    /**联盟分页返回 */
    public addLeagueListVo(voList: Vo.league.LeagueBriefVo[]): void {
        if (!this.serverLeagueList) {
            this.serverLeagueList = voList;
        } else {
            voList.forEach(element => {
                //id相同的不添加
                let isAdd = true;
                this.serverLeagueList.forEach(item => {
                    if (item.leagueId == element.leagueId) {
                        isAdd = false;
                    }
                })
                if (isAdd)
                    this.serverLeagueList.push(element);
            })
        }

        //排序 排序规则：未满员活跃度高>未满员活跃度底>已满员
        this.serverLeagueList.sort((a, b) => {
            let a_cfg = LeagueModel.ins().getLeagueLevelConfig(a.level);
            let b_cfg = LeagueModel.ins().getLeagueLevelConfig(b.level);
            if (a.active > b.active) {
                return -1;
            } else if (a_cfg.memberCount > a.memberCount && b_cfg.memberCount <= b.memberCount) {
                //a未满员 b已满员
                return -1;
            } else if (a_cfg.memberCount <= a.memberCount && b_cfg.memberCount > b.memberCount) {
                //a已满员 b未满员
                return 1;
            }
        })
    }

    public clearRankData(): void {
        this.mRankCommonData = [];

    }

    /**添加联盟排行榜数据 */
    public addRankData(data: EventRankDataResp): void {

        this.mEventRankDataResp = data;

        if (data.dataList && data.dataList.length > 0) {
            let datas = this.mRankCommonData;
            //this.mRankCommonData = this.mRankCommonData.concat(data.dataList as any);
            let dataList: Vo.league.LeagueFightRankItemVo[] = data.dataList as any;
            dataList.forEach(element => {
                //不重复的
                let index = datas.findIndex(item => {
                    return item.leagueId == element.leagueId;
                });
                if (index == -1) {
                    datas.push(element);
                }
            });
        }
    }

    /**添加联盟成员列表数据 */
    public addMemberData(data: Vo.league.LeagueMemberVo[]): void {
        if (data.length) {
            if (!this.mLeagueMemberList) {
                this.mLeagueMemberList = data;
            } else {
                this.mLeagueMemberList = this.mLeagueMemberList.concat(data);
            }
            this.pageIndexMember++;
        }
    }

    /**获取排序后的宝箱任务列表
     * [联盟任务条目]按照[可领取]》[进行中]》[已完成]；任务组[ID小]》[ID大]，自上而下排列
     */
    public getSortedLeagueWeeklyTaskList(isShow: boolean = false): Array<Vo.task.TaskVo[]> {
        let list = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.currentTasks;

        let showList = null
        //能领取
        let list1: Vo.task.TaskVo[] = [];
        //进行中
        let list2: Vo.task.TaskVo[] = [];
        //已完成
        let list3: Vo.task.TaskVo[] = [];

        if (isShow) {
            //代表是展示用 需要筛选 同组任务只展示优先级最高的一个
            let showTaskIdSortMap: Map<number, { task: Vo.task.TaskVo, sort: number }> = new Map()
            list?.forEach((value) => {
                let cfg = G.TableManager.getDataById(table.league.LeagueWeeklyTaskConfig, value.taskId)
                if (cfg && value.state != ServerEnums.TaskState.FINISHED) {
                    let lastSort: number = 0
                    let data: { task: Vo.task.TaskVo, sort: number } = null
                    if (showTaskIdSortMap.has(cfg.groupId)) {
                        lastSort = showTaskIdSortMap.get(cfg.groupId).sort
                        data = showTaskIdSortMap.get(cfg.groupId)
                    } else {
                        data = {
                            task: value,
                            sort: cfg.groupSort
                        }
                        showTaskIdSortMap.set(cfg.groupId, data)
                    }
                    if (cfg.groupSort < lastSort) {
                        //代表优先级更高
                        data.task = value
                        data.sort = cfg.groupSort
                    }
                }

            })
            showList = Array.from(showTaskIdSortMap.values()).map((value) => value.task)
        } else {
            showList = list
        }

        showList.forEach(element => {
            if (element.state == 3)
                list1.push(element);
            else if (element.state == 2)
                list2.push(element);
            else
                list3.push(element);
        });
        let finishedTaskIds = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.finishedTaskIds;
        for (let i = 0; i < finishedTaskIds.length; i++) {
            let id = finishedTaskIds[i];
            let index = list3.findIndex(item => {
                return item.taskId == id;
            });
            if (index == -1) {
                let vo = {} as Vo.task.TaskVo;
                vo.taskId = id;
                vo.type = ServerEnums.TaskType.LEAGUE_WEEKLY;
                vo.state = ServerEnums.TaskState.FINISHED;
                list3.push(vo);
            }
        }
        return [list1, list2, list3];
    }

    /**最大邀请次数*/
    public get maxInviteTimes(): number {
        if (this._maxInviteTimes == -1) {
            this._maxInviteTimes = G.TableManager.getAllData(table.league.LeagueInviteTimesConfig).length
        }
        return this._maxInviteTimes
    }

    /**宝箱任务图标*/
    public get boxIconPath(): string {
        if (!this._boxIconPath) {
            let cfg = G.TableManager.getDataById(table.league.LeagueConstantConfig, 'LEAGUE:BOX_TASK_ICON');
            this._boxIconPath = cfg ? cfg.content : ''
        }
        return this._boxIconPath
    }

    // 获取当前联盟人数
    getLeagueHavePersonCount(): number {
        return this.mLeagueVo?.memberCount || 0;
    }

    // 活跃
    getActiveValue(): number {
        return this.mLeagueVo?.active || 0;
    }

    /**
     * 是否在联盟中
     */
    isInLeague(): boolean {
        const haveLeagueId = this.mLeagueVo?.leagueId != 0;
        const haveLeague2 = this.mLeagueVo?.level > 0;
        return haveLeagueId && haveLeague2;
    }

    getLeaguePlayerDataByMemberId(memberId: number): Vo.league.LeagueMemberVo {
        return this.mLeagueMemberList.find(item => item.id == memberId);
    }

}