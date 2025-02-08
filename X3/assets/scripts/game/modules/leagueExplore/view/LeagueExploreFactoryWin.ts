import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIFormationKey } from "../../formation/const/UIFormationConfig";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { LeaugeExploreBuildingOccupyState } from "../const/LeagueExploreEnum";
import { ILeagueExploreBuildingOpenArgs, UILeagueExploreConfig } from "../const/UILeagueExploreConfig";
import { ILeagueExploreBuildingVo } from "../model/vo/ILeagueExploreBuildingVo";
import { ILeagueExploreConstCfg } from "../model/vo/ILeagueExploreConstCfg";
import { ILeagueExploreIncomeVo } from "../model/vo/ILeagueExploreIncomeVo";
import { LeagueExploreDefendItem } from "./item/LeagueExploreDefendItem";
import { LeagueExploreIncomeItem } from "./item/LeagueExploreIncomeItem";

@bindScript(UILeagueExploreConfig.LeagueExploreFactoryWin)
export class LeagueExploreFactoryWin extends UICommWin {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreFactoryWin";

    protected _args: ILeagueExploreBuildingOpenArgs = null;
    protected _buildingVo: ILeagueExploreBuildingVo = null;
    protected _occupyMembers: Vo.leagueexplore.LeagueExploreMemberVo[] = null;
    protected _occucyState: LeaugeExploreBuildingOccupyState = LeaugeExploreBuildingOccupyState.Idle;
    protected _incomes: ILeagueExploreIncomeVo[] = [];
    protected _timerKey: string = null;
    protected _timerKey2: string = null;
    protected _endTime2: number = 0;
    protected _stateTimerDes: string = '';

    private get view(): ui.leagueExplore.view.LeagueExploreFactoryWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_BUY_ATK_TIMES_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE:
                if (args == this._args?.buildingId) {
                    this.updateUI();
                }
                break;
            case NotificationKey.LEAGUE_EXPLORE_BUY_ATK_TIMES_COMPLETE:
                this.updateUI();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listDefend.setVirtual();
        this.view.listIncome.setVirtual();
        this.view.listDefend.itemRenderer = this.itemRendererForDefend.bind(this);
        this.view.listIncome.itemRenderer = this.itemRendererForIncome.bind(this);
        this.view.btnBuzhen.onClick(this.onClickBuzhen, this);
        this.view.btnRule.onClick(this.onClickRule, this);
        this.view.btnShare.onClick(this.onClickShare, this);
        this.view.btnSure.onClick(this.onClickSure, this);
        this.view.btnZuan.onClick(this.onClickZuan, this);
    }

    protected itemRendererForDefend(index: number, item: LeagueExploreDefendItem): void {
        item.setData(this._occupyMembers[index], index, this._buildingVo);
    }

    protected itemRendererForIncome(index: number, item: LeagueExploreIncomeItem): void {
        item.setData(this._incomes[index]);
    }


    protected onClickBuzhen(): void {
        G.UIManager.open(UIFormationKey.FormationDefendView, FightType.LEAGUE_EXPLORE);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_EXPLORE_FACTORY, this.view.btnRule);
    }

    protected onClickShare(): void {
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreShareWin, this._args.buildingId);
    }

    protected onClickSure(): void {
        if (this._args.isGoto) {
            //传送到指定建筑
            GIns.leagueExploreMgr.enterPlanet(this._buildingVo.cfg.starConfigId, this._buildingVo.cfg.id);
            this.closeSelf();
            return;
        }
        GIns.leagueExploreMgr.handleOperBuildingByVo(this._buildingVo);
    }

    protected onClickZuan(): void {
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreQuickWin);
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remainTime: number = this._buildingVo.vo.robotVo ? this._buildingVo.vo.robotVo.rebirthTime - nowTime : 0;
        if (remainTime <= 0) {
            remainTime = 0;
            this.view.lbDefend.text = '守卫中';
            this.removeTimer();
            return;
        }
        this.view.lbDefend.text = TimeUtils.formatTimeMsToPositiveTimeText(remainTime) + '后重生';
    }

    /**添加计时器*/
    protected addTimer2(): void {
        if (!this._timerKey2) {
            this._timerKey2 = G.GameTimer.loop(500, this, this.onTimer2)
        }
        this.onTimer2();
    }

    /**移除计时器*/
    protected removeTimer2(): void {
        if (this._timerKey2) {
            G.GameTimer.clearByKey(this._timerKey2)
            this._timerKey2 = null
        }
    }

    protected onTimer2(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remainTime: number = this._endTime2 - nowTime;
        if (remainTime <= 0) {
            this.updateStateTimer();
            return;
        }
        this.view.lbStateTime.text = this._stateTimerDes + TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
    }

    /**更新状态计时显示*/
    protected updateStateTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let myInfo = GIns.leagueExploreModel.activityinfo.playerInfoVo;
        let myPlayerId: number = GIns.playerModel.playerId;
        let myLeagueId: number = GIns.LeagueModel.getLeagueId();
        let constCfg: ILeagueExploreConstCfg = GIns.leagueExploreModel.constCfg;
        let curOccupyId: number = GIns.leagueExploreModel.getBuildingOccupyLeagueId(this._buildingVo);
        if (this._buildingVo.vo.buildingState == ServerEnums.LeagueExploreBuildingState.PROTECTED) {
            //判断受保护时间
            if (this._buildingVo.vo.stateEndTime > nowTime) {
                this._endTime2 = this._buildingVo.vo.stateEndTime;
                this._stateTimerDes = '占领保护：'
                this.addTimer2();
                return;
            }
        }
        if (curOccupyId != myLeagueId) {
            if (myInfo.attackLimitTime > 0) {
                //判断战败时间
                if (myInfo.attackLimitTime > nowTime) {
                    this._endTime2 = myInfo.attackLimitTime;
                    this._stateTimerDes = '战败等待：'
                    this.addTimer2();
                    return;
                }
            }
        }
        if (this._buildingVo.vo.capturePlayerMap
            && this._buildingVo.vo.capturePlayerMap[myPlayerId]) {
            let myEndTime = this._buildingVo.vo.capturePlayerMap[myPlayerId] + constCfg.failReoccupyCdSeconds * 1000
            if (myEndTime > nowTime) {
                //重占
                this._endTime2 = myEndTime;
                this._stateTimerDes = '重占等待：';
                this.addTimer2();
                return;
            }
        }
        if (this._buildingVo.vo.captureStartTime && myLeagueId == this._buildingVo.vo.defendLeagueId) {
            //同盟才显示重整时间
            let seatEndTime: number = this._buildingVo.vo.captureStartTime + constCfg.captureCdSeconds * 1000;
            if (seatEndTime > nowTime) {
                //重整
                this._endTime2 = seatEndTime;
                this._stateTimerDes = '重整等待：';
                this.addTimer2();
                return;
            }
        }

        if (this._buildingVo.vo.beAttackPlayerId > 0
            && this._buildingVo.vo.beAttackPlayerId != GIns.playerModel.playerId) {
            //不是自己的建筑需要判断攻击时间配置

            let isSameLeauge: boolean = myLeagueId == this._buildingVo.vo.beAttackLeagueId;
            if (isSameLeauge) {
                let endTime: number = this._buildingVo.vo.beAttackStartTime + constCfg.sameLeagueFightWaitSeconds * 1000;
                if (endTime > nowTime) {
                    this._endTime2 = endTime;
                    this._stateTimerDes = '同盟等待：'
                    this.addTimer2();
                    return;
                }
            } else {
                let endTime: number = this._buildingVo.vo.beAttackStartTime + constCfg.otherLeagueFightWaitSeconds * 1000;
                if (endTime > nowTime) {
                    this._endTime2 = endTime;
                    this._stateTimerDes = '进攻等待：'
                    this.addTimer2();
                    return;
                }
            }
        }

        this.removeTimer2();
        this.view.lbStateTime.text = ''
    }

    protected updateUI(): void {
        if (this._buildingVo.vo == null) {
            //未初始化
            this.view.getController('state').selectedIndex = 7;
            return;
        }
        //驻守状态
        this._occucyState = GIns.leagueExploreModel.getBuildingOccupyState(this._buildingVo);
        if (this._args.isGoto) {
            //是前往功能
            this.view.getController('state').selectedIndex = 6;
        } else {
            this.view.getController('state').selectedIndex = this._occucyState;
        }

        if (this._occucyState == LeaugeExploreBuildingOccupyState.Idle) {
            this.view.lbOccupyName.text = '无';
        } else {
            this.view.lbOccupyName.text = GIns.leagueExploreModel.getBuildingOccupyLeagueName(this._buildingVo);
        }

        //驻守玩家信息
        this._occupyMembers.forEach((value, index) => {
            let memberIndex: number = this._buildingVo.vo.memberVos.findIndex((value) => value.occupyIndex == index + 1);
            if (memberIndex != -1) {
                this._occupyMembers[index] = this._buildingVo.vo.memberVos[memberIndex];
            } else {
                this._occupyMembers[index] = null;
            }
        })
        this.view.listDefend.numItems = this._occupyMembers.length;

        if (this._buildingVo.vo.robotVo?.rebirthTime > 0) {
            this.addTimer();
        } else {
            this.onTimer();
        }

        this.updateStateTimer();
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (GIns.LeagueModel.getLeagueId() <= 0 || GIns.leagueExploreMgr.isActive() == false) {
            //联盟不存在或者活动结束了
            this.closeSelf();
            return;
        }
        this._args = args;
        this._buildingVo = GIns.leagueExploreModel.getBuildingVo(this._args.buildingId);

        if (this._buildingVo == null) {
            //建筑不存在
            this.closeSelf();
            return;
        }

        this.view.lbTitle.text = this._buildingVo.buildingCfg.name;
        this._occupyMembers = new Array(this._buildingVo.cfg.defenderSeatCount).fill(null);
        this.updateUI();
        GIns.leagueExploreModel.sendLoadBuildingInfo({ buildingConfigId: this._args.buildingId });

        this._incomes = GIns.leagueExploreModel.getBuildingIncomes(this._buildingVo);
        this.view.listIncome.numItems = this._incomes.length;
    }

    protected onClose(dontDispose?: boolean): void {
        this.removeTimer();
        this.removeTimer2();
    }
}