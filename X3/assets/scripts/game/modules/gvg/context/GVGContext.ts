import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { EnumGVGTeamType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGTeamType";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { FormationInfoVo } from "db://assets/scripts/game/modules/formation/vo/FormationInfoVo";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { WeekDay } from "db://assets/scripts/core/time/WeekDay";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { ComparatorBuilder } from "db://assets/scripts/core/utils/ComparatorBuilder";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";

/**
 * 联盟对决
 */
export class GVGContext {

    // 阶段
    private _stage: ServerEnums.LeagueWarStatus = ServerEnums.LeagueWarStatus.END;
    // 开始
    private _stageStartTimeMs: number = 0;
    // 结束
    private _stageEndTimeMs: number = 0;
    // 已挑战次数
    private _haveChallengeCount: number = 0;
    // 我血量
    private _myHp: number = 0;
    // 我获得的星星
    private _myGainStarCount: number = 0;

    // 赛季
    private _season: number = 0;
    // 赛季毫秒
    private _seasonSettleTimeMs: number = 0;
    // 是否本服
    private _isLocalServer: boolean = true;
    // 是否首次
    private _isFirstWar: boolean = false;
    // 联盟参与过的次数
    private _leagueHaveJoinTimes: number = 0;

    // ------------- 各个阶段
    private _myLeagueVo: Vo.leaguewar.LeagueWarLeagueVo;
    private _oppoLeagueVo: Vo.leaguewar.LeagueWarLeagueVo;


    // ------------------ 公共
    /**
     * 我方参与玩家列表
     */
    private _myLeagueFighterVoArray: Array<Vo.leaguewar.LeagueWarDefenderVo> = [];

    /**
     * 对手参与玩家列表
     */
    private _oppoLeagueFighterVoArray: Array<Vo.leaguewar.LeagueWarDefenderVo> = [];

    // ------------------ 我自己

    // 我的队伍阵容
    private _myTeamPosArray: Array<Vo.formation.FormationVo> = [];
    // 是否参与玩法 | 匹配中为 true + 没有参赛 = false
    private _isJoinGamePlay: boolean = false;
    // 是否胜利
    private _isWinGamePlay: boolean = false;
    // 是否锁定
    private _isLock: boolean = true;

    // 分层
    private _myLayerToFighterArrayMap: Map<number, Vo.leaguewar.LeagueWarDefenderVo[]> = new Map();
    private _oppoLayerToFighterArrayMap: Map<number, Vo.leaguewar.LeagueWarDefenderVo[]> = new Map();

    private static COMPARATOR_FOR_FIGHTER = ComparatorBuilder.create<Vo.leaguewar.LeagueWarDefenderVo>()
        .addComparator((v1, v2) => {
            if (v1.playerId < 0) {
                return -1;
            }
            if (v2.playerId < 0) {
                return -1
            }
            return 0;
        })
        .addComparator((v1, v2) => {
            return v2.fight - v1.fight;
        })
        .build();

    static create(): GVGContext {
        return new GVGContext();
    }

    reset(data: Vo.leaguewar.LeagueWarVo) {
        if (!data) {
            Logger.warn("[GVG] 联盟对决, 后端数据为空. 前端无法判断什么问题");
            this._isLock = true;
            this._isJoinGamePlay = false;
            this._myLayerToFighterArrayMap = new Map();
            this._oppoLayerToFighterArrayMap = new Map();
            this._oppoLeagueFighterVoArray = [];
            this._myLeagueFighterVoArray = [];
            this._stage = ServerEnums.LeagueWarStatus.END;
            return;
        }


        this._isLock = false;

        this._season = data.season;
        this._seasonSettleTimeMs = data.seasonSettleTime;
        this._stage = data.status as ServerEnums.LeagueWarStatus || ServerEnums.LeagueWarStatus.END;
        this._isJoinGamePlay = data.join;
        this._isLocalServer = data.local;
        this._isFirstWar = data.firstWar;
        this._leagueHaveJoinTimes = data.joinTimes;
        this._isWinGamePlay = data.win;
        // 挑战次数 | server 给的是剩余次数, 我要的是已用次数
        this._haveChallengeCount = GVGConfigManager.maxChallengeTimesPerWar - data.challengeTimes;

        // league
        this._myLeagueVo = data.selfLeagueVo;
        this._oppoLeagueVo = data.opponentLeagueVo;

        // fighter
        this._myLeagueFighterVoArray = (data.selfDefenderVos || []);
        this._oppoLeagueFighterVoArray = (data.opponentDefenderVos || []);


        this.refreshLayerData();

        // TODO 我获得的星星
        this._myGainStarCount = 0;

        const myVo: Vo.leaguewar.LeagueWarDefenderVo = this._myLeagueFighterVoArray
            .find(it => it.playerId == PlayerModel.ins().playerId);
        if (myVo) {
            this._myHp = myVo.hps[0] || GVGConfigManager.getInitMaxHpCount();
        } else {
            this._myHp = GVGConfigManager.getInitMaxHpCount();
        }

        // schema
        this._myTeamPosArray = data.formationVos;

        // time | 各个阶段
        if (this._stage == ServerEnums.LeagueWarStatus.SIGN_UP) {
            this._stageStartTimeMs = data.warStartTime;
            this._stageEndTimeMs = data.setFormationTime;
        }
        if (this._stage == ServerEnums.LeagueWarStatus.SET_FORMATION) {
            this._stageStartTimeMs = data.setFormationTime;
            this._stageEndTimeMs = data.battleTime;
        }
        if (this._stage == ServerEnums.LeagueWarStatus.BATTLE) {
            this._stageStartTimeMs = data.battleTime;
            this._stageEndTimeMs = data.settleTime;
        }
        if (this._stage == ServerEnums.LeagueWarStatus.SETTLE) {
            // 结算阶段, 不对外显示
            this._stageStartTimeMs = data.settleTime;
            this._stageEndTimeMs = data.warEndTime;
        }
        if (this._stage == ServerEnums.LeagueWarStatus.END) {
            this._stageStartTimeMs = data.warEndTime;
            this._stageEndTimeMs = data.nextWarStartTime;
        }


        Logger.game(`
            【联盟对决】 周期表
            当前阶段 = ${this._stage}
            1. 报名阶段 start = ${DateUtils.dateTimeFormat(data.warStartTime)} | ${WeekDay.getWeekDayByTimeMs(data.warStartTime).chineseName}
            2. 布阵阶段 start = ${DateUtils.dateTimeFormat(data.setFormationTime)} | ${WeekDay.getWeekDayByTimeMs(data.setFormationTime).chineseName}
            3. 对战阶段 start = ${DateUtils.dateTimeFormat(data.battleTime)} | ${WeekDay.getWeekDayByTimeMs(data.battleTime).chineseName}
            4. 结算阶段 start = ${DateUtils.dateTimeFormat(data.settleTime)} | ${WeekDay.getWeekDayByTimeMs(data.settleTime).chineseName}
            5. 结束阶段 start = ${DateUtils.dateTimeFormat(data.warEndTime)} | ${WeekDay.getWeekDayByTimeMs(data.warEndTime).chineseName}
            -- 下一周期 start = ${DateUtils.dateTimeFormat(data.nextWarStartTime)} | ${WeekDay.getWeekDayByTimeMs(data.nextWarStartTime).chineseName}
        `);

        // 结算阶段, 不对外显示, 对外显示为结束阶段
        if (this._stage == ServerEnums.LeagueWarStatus.SETTLE) {
            this._stage = ServerEnums.LeagueWarStatus.END;
            this._stageStartTimeMs = data.settleTime;
            this._stageEndTimeMs = data.nextWarStartTime;
        }
        if (this._stage == ServerEnums.LeagueWarStatus.SIGN_UP) {
            // 锦灿说, 报名阶段, 不用给他们看, 直接跳到布阵
            this._stage = ServerEnums.LeagueWarStatus.SET_FORMATION;
            this._stageStartTimeMs = data.warStartTime;
            this._stageEndTimeMs = data.battleTime;
        }

        FacadeManager.ins().emit(NotificationKey.GVG_INFO_CHANGE);
        this.refreshRedDot();
    }

    /**
     * 刷新层数
     * @private
     */
    private refreshLayerData() {
        // 分层 my
        this._myLayerToFighterArrayMap = this._myLeagueFighterVoArray?.toDataStream()
            .groupBy(it => GVGConfigManager.getLayerConfigByLadderId(it.ladderId)?.layerNum || 3);
        this._myLayerToFighterArrayMap.forEach((array, layer) => {
            array.sort(GVGContext.COMPARATOR_FOR_FIGHTER)
        })
        // 分层 oppo
        this._oppoLayerToFighterArrayMap = this._oppoLeagueFighterVoArray?.toDataStream()
            .groupBy(it => GVGConfigManager.getLayerConfigByLadderId(it.ladderId)?.layerNum || 3);
        this._oppoLayerToFighterArrayMap.forEach((array, layer) => {
            array.sort(GVGContext.COMPARATOR_FOR_FIGHTER)
        })
    }

    getPhaseEndTimeMs(): number {
        return this._stageEndTimeMs;
    }

    getRestTimeMs(): number {
        const serverNow = TimeManager.serverNow;
        return Math.max(0, this._stageEndTimeMs - serverNow);
    }

    // 已挑战次数
    getHaveChallengeCount(): number {
        return this._haveChallengeCount;
    }

    // 剩余挑战次数
    getRestChallengeCount(): number {
        return Math.max(0, GVGConfigManager.maxChallengeTimesPerWar - this._haveChallengeCount);
    }

    // 联盟名字
    getLeagueName(type: EnumGVGTeamType): string {
        // 敌
        if (type == EnumGVGTeamType.OPPO) {
            return this._oppoLeagueVo?.name || "";
        }

        // 我
        return this._myLeagueVo?.name || "";
    }

    // 联盟已斩获星星
    getLeagueStarCount(type: EnumGVGTeamType): number {
        // 敌
        if (type == EnumGVGTeamType.OPPO) {
            return this._oppoLeagueVo?.star || 0;
        }

        // 我
        return this._myLeagueVo?.star || 0;
    }

    // 获取挑战层人数
    getLayerPersonCount(teamType: EnumGVGTeamType, layer: number): number {
        let leagueLv = this.getLeagueLv(teamType);
        return GVGConfigManager.getLayerConfig(leagueLv, layer)?.capacity || 0;
    }

    // 联盟等级
    getLeagueLv(teamType: EnumGVGTeamType) {
        if (teamType == EnumGVGTeamType.MY) {
            return this._myLeagueVo?.level || 1;
        }
        return this._oppoLeagueVo?.level || 1;
    }

    /**
     * 获取玩家数据
     * @param teamType
     * @param layer
     * @param layerIndex
     */
    getFighterData(teamType: EnumGVGTeamType,
                   layer: number,
                   layerIndex: number
    ): Vo.leaguewar.LeagueWarDefenderVo | null {

        // 非战斗阶段, 后端未排序, 前端塞人进去
        if (this._stage != ServerEnums.LeagueWarStatus.BATTLE) {
            let leagueLv = this.getLeagueLv(teamType);
            const layerStartRankNumIndex = GVGConfigManager.getLayerStartIndex(leagueLv, layer);

            const index = layerStartRankNumIndex + layerIndex;
            // 计算玩家信息
            if (teamType == EnumGVGTeamType.MY) {
                return this._myLeagueFighterVoArray[index];
            }

            return this._oppoLeagueFighterVoArray[index];
        }

        // 战斗阶段, 用后端的排序层级
        let layerArray: Vo.leaguewar.LeagueWarDefenderVo[] = [];
        if (teamType == EnumGVGTeamType.MY) {
            layerArray = this._myLayerToFighterArrayMap.get(layer);
        } else {
            layerArray = this._oppoLayerToFighterArrayMap.get(layer);
        }

        if (!layerArray) {
            return null;
        }
        return layerArray[layerIndex];

    }


    /**
     * 挑战数据数组
     * @param teamType
     * @param layer
     */
    getLayerCanSeeFighterDataArray(teamType: EnumGVGTeamType,
                                   layer: number
    ): Vo.leaguewar.LeagueWarDefenderVo[] {
        let fighterArray = [];
        if (teamType == EnumGVGTeamType.MY) {
            fighterArray = this._myLayerToFighterArrayMap.get(layer);
        } else {
            fighterArray = this._oppoLayerToFighterArrayMap.get(layer);
        }
        fighterArray = fighterArray || []

        // 获取这一层能看到的人
        return fighterArray;
    }

    isJoin(): boolean {
        return this._isJoinGamePlay;
    }

    /**
     * 是否在开服天数之后
     */
    isAfterOpenDays(): boolean {
        // 未达到开服时间
        return TimeManager.serverHaveOpenDay < GVGConfigManager.firstWarGteServerOpenDay;
    }

    /**
     * 是否开启
     */
    isOpen(): boolean {
        // 未达到开服时间
        if (TimeManager.serverHaveOpenDay < GVGConfigManager.firstWarGteServerOpenDay) {
            return false;
        }

        // 未参与
        if (!this._isJoinGamePlay) {
            return false;
        }
        return this._stage != ServerEnums.LeagueWarStatus.END;
    }

    getStage(): ServerEnums.LeagueWarStatus {
        return this._stage;
    }

    
    getMyTeamPosArray(): Vo.formation.PositionVo[] {
// TODO 这里暂时写死取第一个队伍
        const vo: Vo.formation.FormationVo = this._myTeamPosArray[0];

        const infoVo = FormationInfoVo.createByServerFormation(vo);
        return infoVo.positionVoArray;
    }

    /**
     * 获取个人挑战奖励
     * @param isWin
     */
    getRewardsForLeagueSettle(isWin: boolean): NoOwnerItem[] {
        return GVGConfigManager.getRewardConfigByChallengeCount(
            isWin,
            this._isLocalServer,
        );
    }

    /**
     * 个人挑战奖励
     * @param isWin
     */
    getRewardsForPersonalChallenge(isWin: boolean): NoOwnerItem[] {
        // 联盟参与次数 = 奖励
        return GVGConfigManager.getPersonalChallengeRewards(isWin);
    }

    /**
     * 是否参与了玩法
     */
    isJoinGamePlay(): boolean {
        return this._isJoinGamePlay;
    }

    /**
     * 阶段开始
     */
    getStageStartTimeMs(): number {
        return this._stageStartTimeMs;
    }

    /**
     * 阶段结束
     */
    getStageEndTimeMs(): number {
        return this._stageEndTimeMs;
    }

    getChallengeDataByPlayerId(playerId: number): Vo.leaguewar.LeagueWarDefenderVo {
        return this._oppoLeagueFighterVoArray?.find(it => {
            return it.playerId == playerId;
        })
    }

    getHp(): number {
        return this._myHp;
    }

    onChange(resp: Vo.leaguewar.LeagueWarStarChangeVo) {

        const target = resp.defenderVo;

        // 后端又说不会推对方
        // this._myLeagueFighterVoArray = this._myLeagueFighterVoArray
        //     ?.map(it => {
        //         const isSameName = it.playerId == target.playerId;
        //         return isSameName ? target : it;
        //     });

        if (this._myLeagueVo) {
            this._myLeagueVo.star = resp.star;
        }
        if (this._oppoLeagueVo) {
            this._oppoLeagueVo.star = resp.opponentStar;
        }

        let isChange = false;
        let oldData = null;
        let newData = null;
        if (this._oppoLeagueFighterVoArray) {
            this._oppoLeagueFighterVoArray = this._oppoLeagueFighterVoArray
                .map(it => {
                    const isSameName = it.playerId == target.playerId;
                    if (isSameName) {
                        isChange = true;
                    }
                    if (isSameName) {
                        oldData = it;
                        newData = target;
                        return target;
                    }
                    return it;
                });


        }
        if (isChange) {
            Logger.game("[GVG] 更新了玩家数据. data = ", oldData, newData);
        }

        this.refreshLayerData();

        FacadeManager.ins().emit(NotificationKey.GVG_FIGHTER_DATA_CHANGE);
    }

    changeStage(stage: number) {
        const oldStage = this._stage;
        this._stage = stage;

        // cancel battle 
        if (oldStage == ServerEnums.LeagueWarStatus.BATTLE
            && this._stage != ServerEnums.LeagueWarStatus.BATTLE
        ) {
            // 关闭战斗
            UIManager.ins().close(UICommonKey.CommonBattleView);
            // GIns.battleMgr.cancelBattleIfExists(FightType.LEAGUE_WAR);
        }

        // FacadeManager.ins().emit(NotificationKey.GVG_INFO_CHANGE);
    }

    isCanChallenge(): boolean {
        return this._haveChallengeCount < GVGConfigManager.maxChallengeTimesPerWar
    }

    getMyGainStarCount(): number {
        return this._myGainStarCount;
    }

    /**
     * 那个联盟队伍
     * @param playerId
     */
    isWhichLeagueType(playerId: number): EnumGVGTeamType {
        // 优先敌方
        const oppoFighter = this._oppoLeagueFighterVoArray?.find(it => {
            return it.playerId == playerId
        });
        if (oppoFighter != null) {
            return EnumGVGTeamType.OPPO;
        }
        return EnumGVGTeamType.MY;
    }

    getLeagueId(type: EnumGVGTeamType): number {
        if (type == EnumGVGTeamType.OPPO) {
            return this._oppoLeagueVo?.leagueId;
        } else {
            return this._myLeagueVo?.leagueId;
        }

    }


    getLea(type: EnumGVGTeamType): Vo.leaguewar.LeagueWarLeagueVo | null {
        if (type == EnumGVGTeamType.OPPO) {
            return this._oppoLeagueVo;
        } else {
            return this._myLeagueVo;
        }

    }

    refreshRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.LEAGUE)) {
            return;
        }

        if (!this.isOpen()) {
            return
        }

        if (!this._isJoinGamePlay) {
            return;
        }

        if (this.getRestChallengeCount() > 0) {
            RedDotManager.ins().setRedDot(RedDotKeys.gvg_haveChallengeCount, true)
        }
    }

    isDataReady(): boolean {
        if (!this._myLeagueVo) {
            return false;
        }
        if (!this._oppoLeagueVo) {
            return false;
        }

        // 双方
        if (ArrayUtils.isEmpty(this._myLeagueFighterVoArray)) {
            return false;
        }
        if (ArrayUtils.isEmpty(this._oppoLeagueFighterVoArray)) {
            return false;
        }

        return true;
    }

    isLock(): boolean {
        return this._isLock;
    }

    onQuitLeague() {
        this.reset(null);
    }
}