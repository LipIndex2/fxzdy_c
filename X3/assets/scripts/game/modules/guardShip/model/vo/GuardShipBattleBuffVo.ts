import G from "../../../../../core/comm/G"

/**buff触发类型*/
export enum GuardShipBuffTriggerType {
    /**按时间触发*/
    TIME = 'TIME',
    /**获得道具时*/
    GET_PROP = 'GET_PROP',
    /**升级时*/
    LEVEL_UP = 'LEVEL_UP',
    /**波次开始 (每波怪物入场)时*/
    ROUND_START = 'ROUND_START',
}

/**buff触发配置*/
export interface IGuardShipBattleBuffTriggerCfg {
    type: GuardShipBuffTriggerType
    /**触发间隔 type为时间触发时有效*/
    interval?: number
    /**最多触发次数 0代表无限次*/
    maxTimes?: number
}

/**buff配置*/
export interface IGuardShipBattleBuffCfg {
    /**技能配置*/
    skillCfg: table.guardship.GuardShipSkillConfig
    /**触发配置*/
    triggerCfg: IGuardShipBattleBuffTriggerCfg
}

/**buff数据*/
export class GuardShipBattleBuff {
    id: number
    cfg: IGuardShipBattleBuffCfg
    fromLevels: number[]
    createTime: number
    /**上一次触发时间*/
    lastTriggerTime: number
    /**已触发次数*/
    triggetTimes: number

    /**最大可触发次数*/
    public get maxTriggerTimes(): number {
        if (this.cfg.triggerCfg?.maxTimes > 0) {
            return this.cfg.triggerCfg.maxTimes * this.fromLevels.length
        }
        return 0
    }
}

export interface IGuardShipBattleBuffQuality {
    quality:number
    cnt:number
}

/**
 * 守卫母舰战斗buffvo
 * */
export class GuardShipBattleBuffVo {
    /**buff配置表*/
    protected _cfgMap: Map<number, IGuardShipBattleBuffCfg> = new Map()
    /**当前已有buff触发map表*/
    protected _triggersMap: Map<string, GuardShipBattleBuff[]> = new Map()
    /**当前已拥有buff列表*/
    protected _curBuffMap: Map<number, GuardShipBattleBuff> = new Map()
    /**最大刷新次数*/
    protected _maxRefreshTimes: number = -1
    /**当前已拥有buff列表*/
    curBuffs: GuardShipBattleBuff[] = []
    /**已拥有buff品质数量列表*/
    curBuffQualityCnts:IGuardShipBattleBuffQuality[] = []
    /**已运行时间*/
    runningTime: number = 0
    /**已刷新次数*/
    refreshTimes: number = 0

    /**重置*/
    public reset(): void {
        this._triggersMap.clear()
        this._curBuffMap.clear()
        this.curBuffs.length = 0
        this.curBuffQualityCnts.length = 0
        this.runningTime = 0
        this.refreshTimes = 0
    }

    /**添加buff*/
    public addBuff(buffId: number, fromLevel: number): GuardShipBattleBuff {
        let buffData: GuardShipBattleBuff = null
        if (this._curBuffMap.has(buffId)) {
            buffData = this._curBuffMap.get(buffId)
        } else {
            let cfg: IGuardShipBattleBuffCfg = this.getBuffCfg(buffId);
            if (cfg == null) {
                console.log(`守卫母舰 buff ${buffId}配置不存在添加失败`)
                return null
            }
            buffData = new GuardShipBattleBuff()
            buffData.id = buffId
            buffData.cfg = cfg
            buffData.fromLevels = []
            buffData.createTime = Date.now()
            buffData.lastTriggerTime = 0
            buffData.triggetTimes = 0

            this.curBuffs.push(buffData)
            this._curBuffMap.set(buffId, buffData)
            if (buffData.cfg.triggerCfg) {
                //有触发参数
                let type = buffData.cfg.triggerCfg?.type
                if (type) {
                    let arr = []
                    if (this._triggersMap.has(type)) {
                        arr = this._triggersMap.get(type)
                    } else {
                        arr = []
                        this._triggersMap.set(type, arr)
                    }
                    arr.push(buffData)
                }
            }
        }
        buffData.fromLevels.push(fromLevel)

        let cntIndex = this.curBuffQualityCnts.findIndex((value) => value.quality == buffData.cfg?.skillCfg?.poolValue)
        if (cntIndex == -1) {
            let cntData:IGuardShipBattleBuffQuality = {
                quality:buffData.cfg?.skillCfg?.poolValue,
                cnt:1
            }
            this.curBuffQualityCnts.push(cntData)
            this.curBuffQualityCnts.sort((a, b) => {
                return a.quality - b.quality
            })
        } else {
            let cntData = this.curBuffQualityCnts[cntIndex]
            cntData.cnt++
        }
        return buffData
    }

    /**删除buff*/
    public removeBuff(buffId: number): void {
        if (this._curBuffMap.has(buffId)) {
            let buffData = this._curBuffMap.get(buffId)
            this._curBuffMap.delete(buffId)
            let index = this.curBuffs.indexOf(buffData)
            if (index != -1) {
                this.curBuffs.splice(index, 1)
            }
            if (buffData.cfg?.triggerCfg?.type) {
                let list = this._triggersMap.get(buffData.cfg?.triggerCfg?.type)
                if (list) {
                    let index = list.indexOf(buffData)
                    if (index != -1) {
                        this.curBuffs.splice(index, 1)
                    }
                }
            }
            let cntIndex = this.curBuffQualityCnts.findIndex((value) => value.quality == buffData.cfg?.skillCfg?.poolValue)
            if (cntIndex != -1) {
                let cntData = this.curBuffQualityCnts[cntIndex]
                cntData.cnt -= buffData.fromLevels.length
                if (cntData.cnt <= 0) {
                    this.curBuffQualityCnts.splice(cntIndex, 1)
                }
            }
        }
    }

    /**获取buff数据*/
    public getBuff(buffId:number):GuardShipBattleBuff {
        if (this._curBuffMap.has(buffId)) {
            return this._curBuffMap.get(buffId)
        }
        return
    }

    public getBuffCfg(buffId: number): IGuardShipBattleBuffCfg {
        if (this._cfgMap.has(buffId)) {
            return this._cfgMap.get(buffId)
        }
        let skillCfg = G.TableManager.getDataById(table.guardship.GuardShipSkillConfig, buffId)
        let triggerCfg: IGuardShipBattleBuffTriggerCfg = null
        if (skillCfg?.effectTrigger) {
            triggerCfg = skillCfg.effectTrigger as IGuardShipBattleBuffTriggerCfg
        }
        if (skillCfg) {
            let cfg: IGuardShipBattleBuffCfg = {
                skillCfg: skillCfg,
                triggerCfg: triggerCfg
            }
            this._cfgMap.set(buffId, cfg)
            return cfg
        }
        return null
    }

    /**根据触发类型获取buff列表*/
    public getBuffsByTriggerType(triggerType: GuardShipBuffTriggerType): GuardShipBattleBuff[] {
        if (this._triggersMap.has(triggerType)) {
            return this._triggersMap.get(triggerType)
        }
        return null
    }

    /**获取buff最大触发次数 0代表无限*/
    public getMaxTriggerTimes(buffData: GuardShipBattleBuff): number {
        if (buffData?.cfg?.triggerCfg?.maxTimes > 0) {
            return buffData?.cfg?.triggerCfg?.maxTimes * buffData?.fromLevels.length
        }
        return 0
    }

    /**buff是否已满 不能再选了*/
    public isBuffMax(buffId: number): boolean {
        if (this._curBuffMap.has(buffId)) {
            let buffData = this._curBuffMap.get(buffId)
            if (buffData.cfg.skillCfg.limit > 0 && buffData.fromLevels.length >= buffData.cfg.skillCfg.limit) {
                return true
            }
        }
        return false
    }

    /**最大刷新次数*/
    public get maxRefreshTimes(): number {
        if (this._maxRefreshTimes == -1) {
            let cfgs = G.TableManager.getAllData(table.guardship.GuardShipRefreshConfig)
            this._maxRefreshTimes = cfgs ? cfgs.length : 0
        }
        return this._maxRefreshTimes
    }
}