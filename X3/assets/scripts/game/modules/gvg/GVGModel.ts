import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { GVGContext } from "db://assets/scripts/game/modules/gvg/context/GVGContext";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { TimeUnit } from "db://assets/scripts/core/utils/TimeUnit";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { IBattleResultWinData } from "db://assets/scripts/game/modules/battle/vo/IBattleResultWinData";
import { GVGBattleResultViewOpenArgs } from "db://assets/scripts/game/modules/gvg/structs/GVGBattleResultViewOpenArgs";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import GIns from "db://assets/scripts/game/GIns";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { IBattleResultVo } from "../common/battle/structs/IBattleResultVo";

/**联盟对决 */
export class GVGModel extends BaseModel {

    private _context = GVGContext.create();
    private _sidForNextUpdate: any = null;

    get context(): GVGContext {
        return this._context;
    }

    /**
     * 模块标识
     */
    private MODULE = 48;

    constructor() {
        super();
        this.regist();
    }


    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.EVENT_HAVE_LEAGUE,
            NotificationKey.EVENT_EXIT_LEAGUE,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
            case NotificationKey.EVENT_HAVE_LEAGUE: {
                this.sendGetLeagueWarInfo();
                break;
            }
            case NotificationKey.EVENT_EXIT_LEAGUE: {
                this._context.onQuitLeague();
                break;
            }
        }
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
        this.registerMsg(moduleId, 1, this.recGetLeagueWarInfo);
        this.registerMsg(moduleId, 2, this.recGetLeagueWarReports);
        this.registerMsg(moduleId, 3, this.recUpdateFormation);
        this.registerMsg(moduleId, 4, this.recGetEnemyDefenceInfo);
        this.registerMsg(moduleId, 5, this.recGetSelfDefenceInfo);
        this.registerMsg(moduleId, 6, this.recChallenge, true);
        this.registerMsg(moduleId, 7, this.recGetFightReports);
        this.registerMsg(moduleId, 8, this.recGetPlayerScoreRanks);
        this.registerMsg(moduleId, 9, this.recGetOpponentScoreRanks);
        this.registerMsg(moduleId, 10, this.recGetLeagueRanks);
        this.registerMsg(moduleId, 11, this.recEnterLeagueWar);
        this.registerMsg(moduleId, -1, this.pushStatusChanged);
        this.registerMsg(moduleId, -2, this.pushFightResult);
        this.registerMsg(moduleId, -3, this.pushEnemyStarChanged);

    }

    /*********************************协议发送*********************************/

    /**
     * 获取对决信息
     * 模块号：48	指令号：1
     */
    public sendGetLeagueWarInfo(isChangedState: boolean = false): void {
        if (!GIns.LeagueManager.isInLeague()) {
            Logger.game("不在联盟中");
            return;
        }
        // 在联盟中
        this.send(this.MODULE, 1, null, isChangedState);
    }

    /**
     * 获取联盟对决战绩信息
     * 模块号：48	指令号：2
     */
    public sendGetLeagueWarReports(c2s: any): void {
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 保存防守阵容
     * 模块号：48	指令号：3
     */
    public sendUpdateFormation(c2s: Vo.leaguewar.UpdateFormationC2S): void {
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /**
     * 获取敌人防守信息
     * 模块号：48	指令号：4
     */
    public sendGetEnemyDefenceInfo(c2s: Vo.leaguewar.GetEnemyDefenceInfoC2S): void {
        this.send(this.MODULE, 4, c2s, c2s);
    }

    /**
     * 获取我方防守信息
     * 模块号：48	指令号：5
     */
    public sendGetSelfDefenceInfo(c2s: Vo.leaguewar.GetSelfDefenceInfoC2S): void {
        this.send(this.MODULE, 5, c2s, c2s);
    }

    /**
     * 挑战敌人
     * 模块号：48	指令号：6
     */
    public sendChallenge(c2s: Vo.leaguewar.ChallengeC2S): void {
        this.send(this.MODULE, 6, c2s, c2s);
    }

    /**
     * 获取战报记录
     * 模块号：48	指令号：7
     */
    public sendGetFightReports(c2s: Vo.leaguewar.GetFightReportsC2S): void {
        this.send(this.MODULE, 7, c2s, c2s);
    }

    /**
     * 获取联盟内贡献度排行信息列表
     * 模块号：48	指令号：8
     */
    public sendGetPlayerScoreRanks(): void {
        this.send(this.MODULE, 8);
    }

    /**
     * 获取对手联盟贡献度排行榜
     * 模块号：48	指令号：9
     */
    public sendGetOpponentScoreRanks(): void {
        this.send(this.MODULE, 9);
    }

    /**
     * 获取联盟对决排行
     * 模块号：48	指令号：9
     */
    public sendGetLeagueRanks(c2s: Vo.leaguewar.GetLeagueRanksC2S): void {
        this.send(this.MODULE, 10, c2s, c2s);
    }


    /**
     * 进入联盟对决界面
     * 模块号：48	指令号：11
     */
    public sendEnterLeagueWar(): void {
        this.send(this.MODULE, 11);
    }

    /*********************************协议监听*********************************/

    /**
     * 获取对决信息
     * 模块号：48	指令号：1
     */
    public recGetLeagueWarInfo(data: Vo.leaguewar.GetLeagueWarInfoS2C, isChangedState: boolean): void {
        if (data.code < 0) {
            return;
        }

        const data1 = data.content;
        this._context.reset(data1);

        if (isChangedState) {
            FacadeManager.ins().emit(NotificationKey.GVG_INFO_CHANGE);
        }


        // // next period
        // const endTimeMs = this._context.getStageEndTimeMs();
        // let diffTimeMs = Math.max(0, endTimeMs - TimeManager.serverNow);

        // clearTimeout(this._sidForNextUpdate);
        // if (diffTimeMs <= 0) {
        //     diffTimeMs = TimeUnit.MINUTES.toMilliseconds(1);
        // }

        // // 刷新下一个周期信息
        // this._sidForNextUpdate = setTimeout(() => {
        //     this.sendGetLeagueWarInfo();
        // }, (diffTimeMs + 1000));


    }

    /**
     * 获取联盟对决战绩信息
     * 模块号：48	指令号：2
     */
    public recGetLeagueWarReports(data: any): void {
        if (data.code < 0) {
            return;
        }
        //TODO 在这里处理服务端返回的数据


    }

    /**
     * 保存防守阵容
     * 模块号：48	指令号：3
     */
    public recUpdateFormation(data: Vo.leaguewar.UpdateFormationS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;
        if (content) {
            Logger.game("[GVG] 定制阵容");
            for (let vo of content) {
                FormationManager.ins().updatePosDatas(vo);
            }
        }

        Logger.game("[GVG] 保存玩法的防守阵容成功! ");

    }

    /**
     * 获取敌人防守信息
     * 模块号：48	指令号：4
     */
    public recGetEnemyDefenceInfo(data: Vo.leaguewar.GetEnemyDefenceInfoS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;

        FacadeManager.ins().emit(NotificationKey.GVG_LOAD_OPPO_PLAYER_CHALLENGE_INFO, content)


    }

    /**
     * 获取我方防守信息
     * 模块号：48	指令号：5
     */
    public recGetSelfDefenceInfo(data: Vo.leaguewar.GetSelfDefenceInfoS2C): void {
        if (data.code < 0) {
            return;
        }
        const content = data.content;

        FacadeManager.ins().emit(NotificationKey.GVG_LOAD_OUR_PLAYER_CHALLENGE_INFO, content)

    }

    /**
     * 挑战敌人
     * 模块号：48	指令号：6
     */
    public recChallenge(data: Vo.leaguewar.ChallengeS2C): void {
        // 特殊
        if (data.code == -48018) {
            FloatingTextManager.ins().showTips("联盟成员正在挑战中");
            return;
        }

        if (data.code < 0) {
            return;
        }

        Logger.game("GVG 挑战开始!");

    }

    /**
     * 获取战报记录
     * 模块号：48	指令号：7
     */
    public recGetFightReports(data: Vo.leaguewar.GetFightReportsS2C): void {
        if (data.code < 0) {
            return;
        }

        this.emit(NotificationKey.GVG_LOAD_RECORDS_DONE, data.content)

    }

    /**
     * 获取联盟内贡献度排行信息列表
     * 模块号：48	指令号：8
     */
    public recGetPlayerScoreRanks(data: Vo.leaguewar.GetPlayerScoreRanksS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;

        this.emit(NotificationKey.GVG_LOAD_MY_CONTRIBUTION_DONE, content);


    }


    /**
     * 获取对手联盟贡献度排行榜
     * 模块号：48	指令号：9
     */
    public recGetOpponentScoreRanks(data: Vo.leaguewar.GetOpponentScoreRanksS2C): void {
        if (data.code < 0) {
            return;
        }

        const arg = data.content;
        this.emit(NotificationKey.GVG_LOAD_OPPO_CONTRIBUTION_DONE, arg);
    }


    /**
     * 获取联盟对决排行
     * 模块号：48	指令号：10
     */
    public recGetLeagueRanks(data: Vo.leaguewar.GetLeagueRanksS2C): void {
        if (data.code < 0) {
            return;
        }
        //TODO 在这里处理服务端返回的数据


        const arg = data.content;
        this.emit(NotificationKey.GVG_LOAD_MY_CONTRIBUTION_DONE, arg);
    }


    /**
     * 进入联盟对决界面
     * 模块号：48	指令号：11
     */
    public recEnterLeagueWar(data: Vo.leaguewar.EnterLeagueWarS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }
    /*********************************协议推送*********************************/

    /**
     * 推送状态改变通知，status当前状态Id
     * 模块号：48	指令号：-1
     */
    public pushStatusChanged(stage: number): void {
        this._context.changeStage(stage);
        this.sendGetLeagueWarInfo(true);
    }

    /**
     * 通知战斗结果，LeagueWarFightResultVo
     * 模块号：48	指令号：-2
     */
    public pushFightResult(resp: Vo.leaguewar.LeagueWarFightResultVo): void {

        const winFlag = resp.win;
        const gainStar = resp.gainStar;
        const leagueTotalStar = resp.star;

        // rewards
        const serverRewards = resp.rewardResults || [];
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, serverRewards);

        const rewards = ItemUtils.convertToNoOwnerItemArrayByServerRewards(serverRewards);


        // ？
        let resultVo: IBattleResultVo = { isWin: resp.win, fightType: FightType.LEAGUE_WAR };
        this.emit(NotificationKey.BATTLE_RESULT, resultVo);

        // res
        this.emit(NotificationKey.BATTLE_RESULT_WIN, {
            fightType: FightType.LEAGUE_WAR,
            exData: {
                isWin: winFlag,
                gainStar: gainStar,
                leagueTotalStar: leagueTotalStar,
                rewards: rewards,
                oppoCurHp: resp.leftHp,
                oppoChangeHp: resp.decreaseHp,
            } as GVGBattleResultViewOpenArgs
        } as IBattleResultWinData);

        this.sendGetLeagueWarInfo();
    }

    /**
     * 推送防守方星级变化，LeagueWarStarChangeVo
     * 模块号：48	指令号：-3
     */
    public pushEnemyStarChanged(resp: Vo.leaguewar.LeagueWarStarChangeVo): void {
        // any change
        this._context.onChange(resp)

    }


}