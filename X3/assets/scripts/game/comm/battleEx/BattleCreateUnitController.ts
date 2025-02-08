import { game } from "cc";
import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { IBattleResult } from "../../modules/battle/vo/IBattleResult";
import { IBattleUnitCreateData, IBattleUnitCreateMode } from "../../modules/battle/vo/IBattleUnitCreateData";
import { IBattleUnitData } from "../../modules/battle/vo/IBattleUnitData";
import { UnitType, WorldUnitTeam } from "../battle/enum/BattleEnum";
import { BattleUnit } from "../battle/unit/battle/BattleUnit";
import { BattleConfigManager } from "../battle/config/BattleConfigManager";

/**战斗创建单位管理器 */
export class BattleCreateUnitController extends BaseController {
    /**所有创建数据*/
    protected _createDataMap: Map<number, IBattleUnitCreateData[]> = new Map()
    protected _waitDelBattleCfgIds: number[] = []
    /**计时器key*/
    protected _timerKey: string = null
    /**计时器帧率*/
    protected _createFrame: number = 1
    /**最小创建怪物时间*/
    protected _minCreateTime: number = 0

    protected _curMonsterCnt: number = 0
    /**最大怪物存活数量*/
    protected _maxAliveMonsterCnt: Map<number, number> = new Map()

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.UPDATE_MONSTER_FROM_SERVER,
            NotificationKey.BATTLE_START,
            NotificationKey.BATTLE_END,
            NotificationKey.BATTLE_PLAY_UNIT_DIE
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                //登录或者断线重连 清除所有
                this.clearAll()
                break
            case NotificationKey.UPDATE_MONSTER_FROM_SERVER:
                this.addMonsters(args as Vo.battle.RefreshMonsterBattleContent)
                break
            case NotificationKey.BATTLE_START:
                this._curMonsterCnt = 0
                break;
            case NotificationKey.BATTLE_END:
                let result: IBattleResult = args as IBattleResult
                this.removeByBattleConfigId(result?.battleConfigId)
                break
            case NotificationKey.BATTLE_PLAY_UNIT_DIE:
                this.handleMonsterDead(args as BattleUnit)
                break
        }
    }

    protected get minCreateTime(): number {
        if (this._minCreateTime == 0) {
            this._minCreateTime = this._createFrame * 1000 / Number(game.frameRate)
        }
        return this._minCreateTime
    }

    protected handleMonsterDead(unit: BattleUnit): void {
        if (unit.teamId == WorldUnitTeam.Enemy && (unit.type == UnitType.Monster || unit.type == UnitType.Boss)) {
            this._curMonsterCnt--
        }
    }

    /**获取当前的怪物数量*/
    public get curMonsterCnt():number {
        return this._curMonsterCnt
    }

    /**构建单位创建数据*/
    protected getCreateUnitData(modeCfg: any, defenderUnitDatas: IBattleUnitData[], battleConfigId: number): IBattleUnitCreateData {
        if (!modeCfg) {
            return null
        }
        if (modeCfg.maxAliveCnt) {
            this._maxAliveMonsterCnt.set(battleConfigId, modeCfg.maxAliveCnt)
        }
        if (modeCfg.interval && (modeCfg.preCnt || modeCfg.maxTime)) {
            let interval = Number(modeCfg.interval) * 1000
            let preCnt = modeCfg.preCnt ? Number(modeCfg.preCnt) : 0
            let maxTime = modeCfg.maxTime ? Number(modeCfg.maxTime) : 0
            if (interval <= 0 || (preCnt <= 0 && maxTime <= 0)) {
                console.log('创建单位配置不合法')
                return null
            }
            if (maxTime > 0) {
                //修正preCnt属性
                let minPreCnt = Math.ceil(maxTime / interval * defenderUnitDatas.length)
                if (preCnt < minPreCnt) {
                    preCnt = minPreCnt
                }
            }

            //细化间隔到创建每一个单位
            if (preCnt > 1) {
                let preOneCntTime = Math.floor(interval / preCnt)
                if (preOneCntTime < this.minCreateTime) {
                    //创建间隔不够
                    interval = this.minCreateTime
                    preCnt = Math.ceil(interval / preOneCntTime)
                } else {
                    preCnt = 1
                    interval = preOneCntTime
                }
            }

            let mode: IBattleUnitCreateMode = {
                interval: interval,
                preCnt: preCnt,
                maxTime: maxTime
            }
            let createData: IBattleUnitCreateData = {
                battleConfigId: battleConfigId,
                mode: mode,
                lastCreateTime: 0,
                units: defenderUnitDatas
            }
            return createData
        }
        return null
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.frameLoop(this._createFrame, this, this.onTimer)
        }

    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        if (this._createDataMap.size <= 0) {
            this.removeTimer()
            return
        }
        let nowTime = Date.now()
        this._createDataMap.forEach((list, battleConfigId: number) => {
            if (GIns.battleMgr.battleConfigId == battleConfigId && GIns.battleMgr.isPause) {
                //是当前正在进行的战斗暂停 就不处理
                return
            }
            if (this._curMonsterCnt > 0 && this._maxAliveMonsterCnt.has(battleConfigId)) {
                if (this._curMonsterCnt >= this._maxAliveMonsterCnt.get(battleConfigId)) {
                    //怪物达到上限
                    return
                }
            }
            for (let i = 0; i < list.length; i++) {
                if (nowTime - list[i].lastCreateTime >= list[i].mode.interval) {
                    //可以创建
                    let createCnt: number = Math.min(list[i].units.length, list[i].mode.preCnt)
                    let units = list[i].units.splice(0, createCnt)
                    list[i].lastCreateTime = nowTime
                    this._curMonsterCnt += units.length
                    this.emit(NotificationKey.CREATE_ENEMY_UNITS_BY_PLAY, units)
                    if (list[i].units.length <= 0) {
                        list.splice(i, 1)
                        i--
                    }
                }
            }
            if (list.length <= 0) {
                this._waitDelBattleCfgIds.push(battleConfigId)

            }
        })
        while (this._waitDelBattleCfgIds.length > 0) {
            let key = this._waitDelBattleCfgIds.shift()
            if (this._createDataMap.has(key)) {
                this._createDataMap.delete(key)
            }
        }
    }

    /**生成怪物前的处理*/
    protected handleAddMonstersBefore(defenderUnitDatas: IBattleUnitData[], battleConfigId: number): void {
        if (battleConfigId == GIns.guardShipModel.battleVo.battleConfigId) {
            //守卫母舰需要记录怪物数量
            let isBoss = ServerEnums.GuardShipRoundType[GIns.guardShipModel.battleVo.curRoundCfg?.roundType] == ServerEnums.GuardShipRoundType.BOSS
            if (isBoss && this._createDataMap.has(battleConfigId)) {
                //boss关卡出现 前面的怪物要快速出来了 设置出怪间隔未0
                let list = this._createDataMap.get(battleConfigId)
                if (list) {
                    list.forEach((value) => {
                        //修改出怪间隔 实现快速出怪
                        value.mode.interval = 1
                    })
                }
            }
            defenderUnitDatas.forEach((value) => {
                if (value.type == ServerEnums.UnitType.MONSTER) {
                    let monsterCfg = G.TableManager.getDataById(table.monster.MonsterAttributeConfig, value.configId);
                    let monsterType: number = ServerEnums.MonsterType[monsterCfg?.monsterType]
                    // let isBoss = monsterCfg != null && monsterType == ServerEnums.MonsterType.BOSS
                    GIns.guardShipModel.battleVo.addMonster(value.resourceId, isBoss)
                    let itemId = GIns.guardShipMgr.getDropIdByMonster(monsterType)
                    if (itemId > 0) {
                        value.dropReward = [{ itemId: itemId, num: 1 }]
                    }
                }
            })
            GIns.guardShipModel.battleVo.waitCreateMonster = false
        }
    }

    protected addMonsters(data: Vo.battle.RefreshMonsterBattleContent): void {
        let defenderUnitDatas: IBattleUnitData[] = GIns.battleModel.toBattleUnitDatas(data.refreshMonsterUnitVo);
        this.handleAddMonstersBefore(defenderUnitDatas, data.battleConfigId)
        let battleCfg = G.TableManager.getDataById(table.battle.BattleConfig, data.battleConfigId)
        if (battleCfg) {
            let setCfg = BattleConfigManager.getBattleSettingConfigByKey(battleCfg.fightType);
            let createData = this.getCreateUnitData(setCfg?.monsterCreateMode, defenderUnitDatas, data.battleConfigId)
            if (createData) {
                //存在需要处理的创建模式
                this.addCreateData(createData)
                return
            }
        }
        //其他情况照旧直接创建
        this._curMonsterCnt += defenderUnitDatas.length
        this.emit(NotificationKey.CREATE_ENEMY_UNITS_BY_PLAY, defenderUnitDatas)
    }

    public addCreateData(createData: IBattleUnitCreateData): void {
        if (!createData) {
            return
        }
        let arr = null
        if (this._createDataMap.has(createData.battleConfigId)) {
            arr = this._createDataMap.get(createData.battleConfigId)
        } else {
            arr = []
            this._createDataMap.set(createData.battleConfigId, arr)
        }
        arr.push(createData)
        this.addTimer()
    }

    public removeByBattleConfigId(battleConfigId: number): void {
        if (this._createDataMap.has(battleConfigId)) {
            this._createDataMap.delete(battleConfigId)
        }
    }

    public hasCreateData(battleConfigId: number): boolean {
        return this._createDataMap.has(battleConfigId)
    }

    public clearAll(): void {
        this.removeTimer()
        this._createDataMap.clear()
    }
}

BattleCreateUnitController.ins().doInit()
