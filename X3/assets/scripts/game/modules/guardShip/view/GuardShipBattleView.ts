import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { fsm } from "../../../../core/fsm/FSM";
import { UIView } from "../../../../core/mvc/view/UIView";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../../main/modules/LoginNotificationKey";
import { UnitType, WorldUnitTeam } from "../../../comm/battle/enum/BattleEnum";
import { FightType } from "../../../comm/battle/enum/FightType";
import { BattleUnit } from "../../../comm/battle/unit/battle/BattleUnit";
import { MonsterUnit } from "../../../comm/battle/unit/battle/MonsterUnit";
import { BattleCreateUnitController } from "../../../comm/battleEx/BattleCreateUnitController";
import { WorldController } from "../../../comm/world/WorldController";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { GuardShipFSMEvent, GuardShipFSMState } from "../const/GuardShipFSMEnum";
import { UIGuardShipConfig } from "../const/UIGuardShipConfig";
import { GuardShipCreateMonsterState } from "../fsm/GuardShipCreateMonsterState";
import { GuardShipEndState } from "../fsm/GuardShipEndState";
import { GuardShipIdleState } from "../fsm/GuardShipIdleState";
import { GuardShipRoundState } from "../fsm/GuardShipRoundState";
import { GuardShipBuffTriggerType } from "../model/vo/GuardShipBattleBuffVo";
import { GuardShipBuffItem } from "./item/GuardShipBuffItem";
import { GuardShipPropItem } from "./item/GuardShipPropItem";

/**
 * 守卫母舰战斗界面
 */
@bindScript(UIGuardShipConfig.GuardShipBattleView)
export class GuardShipBattleView extends UIView {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipBattleView";

    protected _fsm: fsm.Machine = null
    /**状态机计时器 不涉及战斗 设置成500毫秒够用了*/
    protected _fsmTimerInterval: number = 500
    protected _curCfg: table.guardship.GuardShipInstanceConfig
    protected _curRound: number = 0
    protected _curLevel: number = -1
    protected _isEnd: boolean = false
    protected _pauseUICnt: number = 0
    /**缓存的死亡列表*/
    protected _deadUids: number[] = []

    private get view(): ui.guardShip.view.GuardShipBattleView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.BATTLE_START,
            NotificationKey.BATTLE_RESULT,
            NotificationKey.GUARDSHIP_SELECT_BUFF_UPDATE,
            NotificationKey.GUARDSHIP_SELECT_BUFF_REFRESH,
            NotificationKey.GUARDSHIP_ROUND_UPDATE,
            NotificationKey.GUARDSHIP_BUFF_UPDATE,
            NotificationKey.GUARDSHIP_DROP_ITEM_CHANGE,
            NotificationKey.BATTLE_PLAY_UNIT_DIE,
            NotificationKey.BATTLE_DROP,
            NotificationKey.BATTLE_CLEAR_WAITING_CACHE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.quitBattle()
                break
            case NotificationKey.BATTLE_START:
                this.handleBattleStart()
                break
            case NotificationKey.BATTLE_RESULT:
                if ((args as IBattleResultVo)?.fightType == FightType.GUARD_SHIP) {
                    this._fsm.trans(GuardShipFSMEvent.BacktoIdle);
                }
                break
            case NotificationKey.GUARDSHIP_SELECT_BUFF_UPDATE:
                this.handeSelectBuff()
                break
            case NotificationKey.GUARDSHIP_SELECT_BUFF_REFRESH:
                this.handleRefreshBuff()
                break
            case NotificationKey.GUARDSHIP_ROUND_UPDATE:
                this._fsm.trans(GuardShipFSMEvent.BacktoIdle)
                this.updateRound()
                break
            case NotificationKey.GUARDSHIP_BUFF_UPDATE:
                this.updateBuffs()
                this.tryToTriggerBuffNow(args)
                break
            case NotificationKey.GUARDSHIP_DROP_ITEM_CHANGE:
                this.updateProps()
                break
            case NotificationKey.BATTLE_PLAY_UNIT_DIE:
                this.handleMonsterDead(args as BattleUnit)
                break
            case NotificationKey.BATTLE_DROP:
                this.handleBattleDrop(args)
                break
            case NotificationKey.BATTLE_CLEAR_WAITING_CACHE:
                this.handleClearWaitingCache()
                break

        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this._fsm = fsm.Machine.create({
            initState: GuardShipFSMState.Idle,
            states: [
                new GuardShipIdleState(),
                new GuardShipRoundState(),
                new GuardShipCreateMonsterState(),
                new GuardShipEndState(),
            ],
            events: [
                { name: GuardShipFSMEvent.BacktoIdle, from: fsm.ANY_EVENT, to: GuardShipFSMState.Idle },
                { name: GuardShipFSMEvent.GotoRound, from: GuardShipFSMState.Idle, to: GuardShipFSMState.Round },
                { name: GuardShipFSMEvent.GotoCreateMonster, from: GuardShipFSMState.Round, to: GuardShipFSMState.CreateMonster },
                { name: GuardShipFSMEvent.GotoEnd, from: GuardShipFSMState.Idle, to: GuardShipFSMState.End },
            ],
            callback: this.onFSMStateChange.bind(this)
        })

        this.view.listBuff.setVirtual()
        this.view.listBuff.itemRenderer = this.itemRendererForBuff.bind(this)
        this.view.listProp.setVirtual()
        this.view.listProp.itemRenderer = this.itemRendererForProp.bind(this)
        this.view.listBuff.onClick(this.onClickBuff, this)
        this.view.btnPlay.onClick(this.onClickPlay, this)
        this.view.btnBack.onClick(this.onClickBack, this)
        this.view.btnHero.onClick(this.onClickHero, this)

        //关闭属性查看
        this.view.btnHero.visible = false
    }

    protected onClickHero(): void {
        G.UIManager.open(UIGuardShipConfig.GuardShipHeroAttrWin)
    }

    protected onPreDispose(): void {
        this._fsm.dispose()
        this._fsm = null
    }

    protected onFSMStateChange(from: string, to: string): void {
        let battleVo = GIns.guardShipModel.battleVo
        if (to == GuardShipFSMState.Round) {
            this.view.lbTime.visible = !battleVo.isBossRound() && !battleVo.isLastRound()
            this.updateRoundTime()
        } else if (to == GuardShipFSMState.End) {
            this.view.lbTime.visible = false
            this.checkBattleEnd()
        }
    }

    protected itemRendererForBuff(index: number, item: GuardShipBuffItem): void {
        item.setData(GIns.guardShipModel.battleBuffVo.curBuffQualityCnts[index])
    }

    protected itemRendererForProp(index: number, item: GuardShipPropItem): void {
        item.setData(GIns.guardShipModel.battleVo.curPropIds[index])
    }

    protected onClickBuff(): void {
        if (GIns.guardShipModel.battleBuffVo.curBuffs.length > 0) {
            G.UIManager.open(UIGuardShipConfig.GuardShipBuffShowWin, {
                closeFunc: () => {
                    this.pauseUICnt--
                }
            }, () => {
                this.pauseUICnt++
            })
        }
    }

    protected onClickPlay(): void {
        G.UIManager.open(UICommonKey.BtnConfirmView, {
            // 标题
            title: '提示',
            // 取消
            titleCancel: '继续',
            // 确认
            titleConfirm: '退出',
            // 内容
            content: '是否继续游戏？',
            // 点击确认回调
            onBtnYes: () => {
                this.cancelBattle()
            },
            closeCb: (isClickYes: boolean) => {
                this.pauseUICnt--
            },
        } as BtnConfirmViewOpenArgs, () => {
            this.pauseUICnt++
        })
    }

    protected onClickBack(): void {
        GIns.battleModel.showExitView(CommonI18nKeys.ExitBattleAlertTitle, CommonI18nKeys.ExitBattleAlertContent, () => {
            this.cancelBattle();
        })
    }

    protected onTimer(): void {
        if (GIns.battleMgr.isPause) {
            return
        }
        let battleVo = GIns.guardShipModel.battleVo
        if (battleVo.constCfg.maxMonsterCnt > 0) {
            let curMonsterCnt:number = BattleCreateUnitController.ins().curMonsterCnt
            if (curMonsterCnt >= battleVo.constCfg.maxMonsterCnt) {
                //怪物达到最大数量 暂停战斗流程
                return
            }
        }
        this._fsm.update(this._fsmTimerInterval)
        this.updateRoundTime()

        let battleBuffVo = GIns.guardShipModel.battleBuffVo
        battleBuffVo.runningTime += this._fsmTimerInterval
        this.executeBuffTrigger(GuardShipBuffTriggerType.TIME)
    }

    protected updateRoundTime(): void {
        if (this.view.lbTime.visible) {
            let battleVo = GIns.guardShipModel.battleVo
            if (battleVo.isLastRound()) {
                this.view.lbTime.visible = false
                return
            }
            let endTime = battleVo.nextRoundCfg?.delayTime
            let curTime = battleVo.nextRoundDelay
            let offsetTime = Math.max(0, Math.ceil(endTime - curTime))
            this.view.lbTime.text = `距离下一波还有${offsetTime}秒`
        }
    }

    protected updateUI(): void {
        this.updateRound()
        this.updateLevel()
        this.updateBuffs()
        this.updateProps()
    }

    protected updateBuffs(): void {
        let battleBuffVo = GIns.guardShipModel.battleBuffVo
        this.view.listBuff.numItems = battleBuffVo.curBuffQualityCnts.length
    }

    protected updateProps(): void {
        this.view.listProp.numItems = GIns.guardShipModel.battleVo.curPropIds.length
        this.view.listProp.resizeToFit()
    }

    protected updateRound(): void {
        let battleVo = GIns.guardShipModel.battleVo
        let curRound = Math.max(0, battleVo.curRoundIdx + 1)
        this.view.lbRound.text = curRound + '/' + battleVo.roundCfgs.length
        if (this._curRound != curRound) {
            this._curRound = curRound
            this.executeBuffTrigger(GuardShipBuffTriggerType.ROUND_START)
        }
    }

    protected updateLevel(): void {
        let battleVo = GIns.guardShipModel.battleVo
        let lastLevelCfg = battleVo.lastLevelCfg
        let curLevelCfg = battleVo.curLevelCfg
        this.view.lbLv.text = 'Lv.' + curLevelCfg.id
        if (this._curLevel != curLevelCfg.id) {
            this._curLevel = curLevelCfg.id
            this.view.progressLv.min = lastLevelCfg ? lastLevelCfg.minExp : 0
            this.view.progressLv.max = curLevelCfg.minExp
            this.executeBuffTrigger(GuardShipBuffTriggerType.LEVEL_UP)
        }
        this.view.progressLv.value = battleVo.curExp
    }

    protected tryToTriggerBuffNow(buffId: number): void {
        let battleBuffVo = GIns.guardShipModel.battleBuffVo
        let buffData = battleBuffVo.getBuff(buffId)
        if (buffData && buffData.cfg.triggerCfg == null) {
            //没有触发条件 添加完buff 马上就触发
            GIns.battleDebugMgr.debugAddSkillByShip(buffId)
        }
    }

    protected executeBuffTrigger(triggerType: GuardShipBuffTriggerType): void {
        let battleBuffVo = GIns.guardShipModel.battleBuffVo
        let buffs = battleBuffVo.getBuffsByTriggerType(triggerType)
        if (buffs?.length > 0) {
            buffs.forEach((value) => {
                let maxTriggerTimes = value.maxTriggerTimes
                if (maxTriggerTimes > 0 && value.triggetTimes >= maxTriggerTimes) {
                    //已达最大触发次数
                    return
                }
                if (triggerType == GuardShipBuffTriggerType.TIME) {
                    //时间类可触发
                    if (battleBuffVo.runningTime - value.lastTriggerTime >= value.cfg.triggerCfg.interval) {
                        value.lastTriggerTime = battleBuffVo.runningTime
                        GIns.battleDebugMgr.debugAddSkillByShip(value.id)
                    }
                } else {
                    //其他类型
                    GIns.battleDebugMgr.debugAddSkillByShip(value.id)
                }
            })
        }
    }

    /**检测战斗是否结束*/
    protected checkBattleEnd(): void {
        if (this._fsm.curState?.name == GuardShipFSMState.End) {
            let battleVo = GIns.guardShipModel.battleVo
            if (this._isEnd == false && battleVo.hasNoMonster()) {
                //怪物死完了算胜利
                this._isEnd = true
                WorldController.ins().onBattleEnd(ServerEnums.BattleResult.ATTACKER)
            }
        }
    }

    protected handeSelectBuff(): void {
        //如果大于1 代表还在处理旧的选buff逻辑
        if (this._isEnd == false
            && (GIns.guardShipModel.battleVo.waitSelectBuffs.length == 1
                || !G.UIManager.isActive(UIGuardShipConfig.GuardShipBuffSelectWin))) {
            this.handleNextSelectBuff()
        }
    }

    protected handleRefreshBuff(): void {
        if (!G.UIManager.isActive(UIGuardShipConfig.GuardShipBuffSelectWin)) {
            G.UIManager.open(UIGuardShipConfig.GuardShipBuffSelectWin, {
                closeFunc: () => {
                    this.pauseUICnt--
                    if (this._isEnd == false) {
                        this.handleNextSelectBuff()
                    }
                }
            }, () => {
                this.pauseUICnt++
            })
        }
    }

    protected handleNextSelectBuff(): void {
        let battleVo = GIns.guardShipModel.battleVo
        if (battleVo.waitSelectBuffs.length > 0) {
            let firstData = battleVo.waitSelectBuffs[0]
            let buffIds = GIns.guardShipMgr.getBuffIdsForLevel(firstData.level, firstData.optionalCount)
            GIns.battleModel.sendRefreshBuff(buffIds, firstData.level, firstData.selectCount, true, battleVo.battleConfigId)
        }
    }

    protected handleMonsterDead(unit: BattleUnit): void {
        if (unit.teamId == WorldUnitTeam.Enemy && (unit.type == UnitType.Monster || unit.type == UnitType.Boss)) {
            let monsterUnit = unit as MonsterUnit
            let battleVo = GIns.guardShipModel.battleVo
            battleVo.deleteMonster(monsterUnit.resourceId)
            if (battleVo.isBossRound() && battleVo.hasNoBoss()) {
                //boss死亡啦
                if (battleVo.isLastRound() == false) {
                    //进入下一回合
                    this._fsm.trans(GuardShipFSMEvent.GotoCreateMonster)
                }
            }
            let monsterType = ServerEnums.MonsterType[monsterUnit.cfg.monsterType]
            let addExp = 0
            if (battleVo.constCfg.monsterExp.has(monsterType)) {
                addExp = battleVo.constCfg.monsterExp.get(monsterType)
            }
            battleVo.addExp(addExp)
            this.updateLevel()
            this.checkBattleEnd()
        }
    }

    protected handleClearWaitingCache(): void {
        let battleVo = GIns.guardShipModel.battleVo
        battleVo.cacheAddExp = 0
    }

    /**处理怪物掉落*/
    protected handleBattleDrop(props: { itemId: number, num: number }[]): void {
        let newProps = []
        let battleVo = GIns.guardShipModel.battleVo
        let maxPropCnt = battleVo.constCfg.maxUseItemCnt
        for (let i = props.length - 1; i >= 0; i--) {
            //从最新的开始 到了上限就退出
            newProps = newProps.concat(new Array(props[i].num).fill(props[i].itemId))
            if (newProps.length >= maxPropCnt) {
                break
            }
        }
        battleVo.curPropIds = battleVo.curPropIds.concat(newProps)
        if (battleVo.curPropIds.length > maxPropCnt) {
            //移除超出的道具
            let startIndex = battleVo.curPropIds.length - maxPropCnt
            battleVo.curPropIds = battleVo.curPropIds.slice(startIndex)
        }
        this.updateProps()
        this.executeBuffTrigger(GuardShipBuffTriggerType.GET_PROP)
    }

    //主动取消战斗
    protected cancelBattle() {
        G.FacadeManager.emit(NotificationKey.BATTLE_CANCEL);
        G.GameTimer.clearAll(this)
    }

    protected quitBattle(): void {
        this.closeSelf()
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
    }

    protected handleBattleStart(): void {
        G.GameTimer.clearAll(this)
        G.GameTimer.loop(this._fsmTimerInterval, this, this.onTimer)
        this._fsm.start()
    }

    /**初始化战斗数据*/
    protected initBattleVo(instaceCfg: table.guardship.GuardShipInstanceConfig): void {
        let battleVo = GIns.guardShipModel.battleVo
        let roundCfgs = []
        instaceCfg.roundIds?.forEach((roundId: number) => {
            let roundCfg = G.TableManager.getDataById(table.guardship.GuardShipRoundConfig, roundId)
            if (roundCfg) {
                roundCfgs.push(roundCfg)
            }
        })
        battleVo.init(instaceCfg, roundCfgs)

        let battleBuffVo = GIns.guardShipModel.battleBuffVo
        battleBuffVo.reset()

        /**初始化buff随机池*/
        const vo = GIns.formationMgr.getFormationVoByType(FightType.GUARD_SHIP)
        GIns.guardShipMgr.initBuffPool(vo)
    }

    public get pauseUICnt(): number {
        return this._pauseUICnt
    }

    public set pauseUICnt(value: number) {
        if (this._pauseUICnt != value) {
            this._pauseUICnt = value
            if (this._pauseUICnt > 0) {
                this.emit(NotificationKey.PAUSE_BATTLE)
            } else if (this._isEnd == false) {
                this.emit(NotificationKey.CONTINUE_BATTLE)
            }
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._isEnd = false
        this._curLevel = -1
        this._pauseUICnt = 0
        let curChallFloor = GIns.guardShipModel.curChallFloor
        let instaceCfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig, curChallFloor)
        if (instaceCfg == null) {
            //关卡配置不存在
            this.quitBattle()
            return
        }
        this.initBattleVo(instaceCfg)
        this.updateUI()

    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this)
        GIns.guardShipModel.battleVo.reset()
    }
}